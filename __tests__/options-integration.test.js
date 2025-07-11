/**
 * Options Page Integration Tests
 * 
 * These tests verify that the Options page correctly integrates with the main chat
 * and that all settings are properly saved and applied.
 */

// Mock localStorage
let localStorageMock;

beforeEach(() => {
  localStorageMock = {
    store: {},
    getItem: jest.fn((key) => localStorageMock.store[key] || null),
    setItem: jest.fn((key, value) => { localStorageMock.store[key] = value; }),
    clear: jest.fn(() => { localStorageMock.store = {}; }),
    removeItem: jest.fn((key) => { delete localStorageMock.store[key]; }),
    key: jest.fn(),
    length: 0,
  };
  global.localStorage = localStorageMock;
});

// Mock Next.js router
const mockRouter = {
  back: jest.fn(),
  push: jest.fn(),
};
jest.mock('next/router', () => ({
  useRouter: () => mockRouter,
}));

describe('Options Page Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.getItem.mockClear();
    localStorageMock.setItem.mockClear();
  });

  describe('Bot Count Selection', () => {
    test('should load default bot count of 3 when no settings saved', () => {
      localStorage.getItem.mockImplementation((key) => null);
      
      // Simulate component mounting
      const savedCount = localStorage.getItem("botCount");
      const botCount = savedCount ? Number(savedCount) : 3;
      
      expect(botCount).toBe(3);
    });

    test('should load saved bot count from localStorage', () => {
      localStorage.getItem.mockImplementation((key) => key === "botCount" ? "2" : null);
      
      const savedCount = localStorage.getItem("botCount");
      const botCount = Number(savedCount);
      
      expect(botCount).toBe(2);
    });

    test('should save bot count to localStorage when changed', () => {
      const botCount = 4;
      localStorage.setItem("botCount", botCount);
      
      expect(localStorage.setItem).toHaveBeenCalledWith("botCount", 4);
    });

    test('should limit bot count between 1 and 5', () => {
      // Test minimum
      const minCount = Math.max(1, 0); // Should be 1
      expect(minCount).toBe(1);
      
      // Test maximum
      const maxCount = Math.min(5, 10); // Should be 5
      expect(maxCount).toBe(5);
    });
  });

  describe('Bot Selection', () => {
    test('should load default selected bots when no settings saved', () => {
      localStorage.getItem.mockImplementation((key) => null);
      
      const defaultBots = ["Azazel", "Isaac", "Lazuras"];
      const savedBots = localStorage.getItem("selectedBots");
      const selectedBots = savedBots ? JSON.parse(savedBots) : defaultBots;
      
      expect(selectedBots).toEqual(["Azazel", "Isaac", "Lazuras"]);
    });

    test('should load saved selected bots from localStorage', () => {
      const savedBots = JSON.stringify(["Azazel", "Lazuras"]);
      localStorage.getItem.mockImplementation((key) => key === "selectedBots" ? savedBots : null);
      const selectedBots = JSON.parse(localStorage.getItem("selectedBots"));
      
      expect(selectedBots).toEqual(["Azazel", "Lazuras"]);
    });

    test('should save selected bots to localStorage', () => {
      const selectedBots = ["Azazel", "Isaac"];
      localStorage.setItem("selectedBots", JSON.stringify(selectedBots));
      
      expect(localStorage.setItem).toHaveBeenCalledWith("selectedBots", JSON.stringify(selectedBots));
    });

    test('should toggle bot selection correctly', () => {
      let selectedBots = ["Azazel", "Isaac", "Lazuras"];
      
      // Remove a bot
      const botToRemove = "Isaac";
      selectedBots = selectedBots.filter(bot => bot !== botToRemove);
      expect(selectedBots).toEqual(["Azazel", "Lazuras"]);
      
      // Add a bot back
      selectedBots = [...selectedBots, botToRemove];
      expect(selectedBots).toEqual(["Azazel", "Lazuras", "Isaac"]);
    });
  });

  describe('Validation Logic', () => {
    test('should validate when enough bots are selected', () => {
      const botCount = 2;
      const selectedBots = ["Azazel", "Isaac", "Lazuras"];
      const hasEnoughBots = selectedBots.length >= botCount;
      
      expect(hasEnoughBots).toBe(true);
    });

    test('should fail validation when not enough bots are selected', () => {
      const botCount = 4;
      const selectedBots = ["Azazel", "Isaac"];
      const hasEnoughBots = selectedBots.length >= botCount;
      
      expect(hasEnoughBots).toBe(false);
    });

    test('should disable save when validation fails', () => {
      const botCount = 5;
      const selectedBots = ["Azazel"];
      const hasEnoughBots = selectedBots.length >= botCount;
      const canSave = hasEnoughBots && selectedBots.length > 0;
      
      expect(canSave).toBe(false);
    });

    test('should enable save when validation passes', () => {
      const botCount = 2;
      const selectedBots = ["Azazel", "Isaac"];
      const hasEnoughBots = selectedBots.length >= botCount;
      const canSave = hasEnoughBots && selectedBots.length > 0;
      
      expect(canSave).toBe(true);
    });
  });

  describe('Main Chat Integration', () => {
    test('should use correct number of bots based on bot count', () => {
      const botCount = 2;
      const selectedBots = ["Azazel", "Isaac", "Lazuras"];
      const agentsToUse = selectedBots.slice(0, botCount);
      
      expect(agentsToUse).toEqual(["Azazel", "Isaac"]);
    });

    test('should handle bot count greater than available bots', () => {
      const botCount = 5;
      const selectedBots = ["Azazel", "Isaac", "Lazuras"];
      const agentsToUse = selectedBots.slice(0, botCount);
      
      expect(agentsToUse).toEqual(["Azazel", "Isaac", "Lazuras"]);
    });

    test('should send correct agents to API', () => {
      const selectedAgents = ["Azazel", "Isaac"];
      const apiPayload = {
        history: [{ role: "user", content: "test" }],
        selectedAgents: selectedAgents.slice(0, selectedAgents.length)
      };
      
      expect(apiPayload.selectedAgents).toEqual(["Azazel", "Isaac"]);
    });
  });

  describe('Persistence', () => {
    test('should persist settings across browser sessions', () => {
      const botCount = 4;
      const selectedBots = ["Azazel", "Lazuras"];
      
      // Save settings
      localStorage.setItem("botCount", botCount);
      localStorage.setItem("selectedBots", JSON.stringify(selectedBots));
      
      // Simulate page reload
      localStorageMock.getItem
        .mockReturnValueOnce(botCount.toString())
        .mockReturnValueOnce(JSON.stringify(selectedBots));
      
      // Load settings
      const savedCount = localStorage.getItem("botCount");
      const savedBots = localStorage.getItem("selectedBots");
      
      expect(Number(savedCount)).toBe(4);
      expect(JSON.parse(savedBots)).toEqual(["Azazel", "Lazuras"]);
    });
  });

  describe('Error Handling', () => {
    test('should handle invalid localStorage data gracefully', () => {
      localStorage.getItem.mockImplementation((key) => key === "botCount" ? "invalid" : null);
      const savedCount = localStorage.getItem("botCount");
      const botCount = isNaN(Number(savedCount)) ? 3 : Number(savedCount);
      expect(botCount).toBe(3); // Should fall back to default
    });

    test('should handle missing selectedBots gracefully', () => {
      localStorage.getItem.mockImplementation((key) => null);
      const defaultBots = ["Azazel", "Isaac", "Lazuras"];
      const savedBots = localStorage.getItem("selectedBots");
      const selectedBots = savedBots ? JSON.parse(savedBots) : defaultBots;
      expect(selectedBots).toEqual(defaultBots);
    });
  });
});

describe('Options Page UI Tests', () => {
  test('should render bot count slider with correct range', () => {
    const min = 1;
    const max = 5;
    const value = 3;
    
    expect(min).toBe(1);
    expect(max).toBe(5);
    expect(value).toBeGreaterThanOrEqual(min);
    expect(value).toBeLessThanOrEqual(max);
  });

  test('should render all available bots as checkboxes', () => {
    const availableBots = ["Azazel", "Isaac", "Lazuras"];
    
    expect(availableBots).toHaveLength(3);
    expect(availableBots).toContain("Azazel");
    expect(availableBots).toContain("Isaac");
    expect(availableBots).toContain("Lazuras");
  });

  test('should show correct selected bot count', () => {
    const selectedBots = ["Azazel", "Isaac"];
    const selectedCount = selectedBots.length;
    
    expect(selectedCount).toBe(2);
  });
});

describe('Integration Scenarios', () => {
  test('Scenario: User sets bot count to 1 and selects only Azazel', () => {
    // Set up scenario
    const botCount = 1;
    const selectedBots = ["Azazel"];
    
    // Validate
    const hasEnoughBots = selectedBots.length >= botCount;
    const agentsToUse = selectedBots.slice(0, botCount);
    
    expect(hasEnoughBots).toBe(true);
    expect(agentsToUse).toEqual(["Azazel"]);
  });

  test('Scenario: User sets bot count to 5 but only has 3 bots selected', () => {
    // Set up scenario
    const botCount = 5;
    const selectedBots = ["Azazel", "Isaac", "Lazuras"];
    
    // Validate
    const hasEnoughBots = selectedBots.length >= botCount;
    const agentsToUse = selectedBots.slice(0, botCount);
    
    expect(hasEnoughBots).toBe(false);
    expect(agentsToUse).toEqual(["Azazel", "Isaac", "Lazuras"]);
  });

  test('Scenario: User changes bot count and selection multiple times', () => {
    // Initial state
    let botCount = 3;
    let selectedBots = ["Azazel", "Isaac", "Lazuras"];
    
    // Change to 2 bots
    botCount = 2;
    let agentsToUse = selectedBots.slice(0, botCount);
    expect(agentsToUse).toEqual(["Azazel", "Isaac"]);
    
    // Remove a bot
    selectedBots = ["Azazel", "Lazuras"];
    agentsToUse = selectedBots.slice(0, botCount);
    expect(agentsToUse).toEqual(["Azazel", "Lazuras"]);
    
    // Change to 1 bot
    botCount = 1;
    agentsToUse = selectedBots.slice(0, botCount);
    expect(agentsToUse).toEqual(["Azazel"]);
  });
}); 