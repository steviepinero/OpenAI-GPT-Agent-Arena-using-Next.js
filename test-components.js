// Quick Component Tests
// Run with: node test-components.js

console.log('🧪 Running Quick Component Tests...\n');

// Test 1: AgentBubble Component
console.log('Test 1: AgentBubble Component');
function testAgentBubble() {
  const mockProps = {
    name: 'Azazel',
    text: 'Hello, this is a test message!',
    timestamp: '12:34 PM'
  };

  // Test gradient class assignment
  const AGENT_GRADIENTS = {
    Azazel: "from-red-100 to-red-300",
    Isaac: "from-blue-100 to-blue-300",
    Lazuras: "from-purple-100 to-purple-300"
  };

  const expectedGradient = AGENT_GRADIENTS[mockProps.name];
  const fallbackGradient = "from-gray-100 to-white";

  // Test known agent gradient
  if (expectedGradient === "from-red-100 to-red-300") {
    console.log('✅ Azazel gradient class correct');
  } else {
    console.log('❌ Azazel gradient class incorrect');
  }

  // Test unknown agent fallback
  const unknownAgentGradient = AGENT_GRADIENTS['UnknownAgent'] || fallbackGradient;
  if (unknownAgentGradient === fallbackGradient) {
    console.log('✅ Unknown agent fallback gradient correct');
  } else {
    console.log('❌ Unknown agent fallback gradient incorrect');
  }

  // Test text safety
  const safeText = typeof mockProps.text === "string" ? mockProps.text : "";
  if (safeText === mockProps.text) {
    console.log('✅ Text safety check working');
  } else {
    console.log('❌ Text safety check failed');
  }

  console.log('');
}

// Test 2: Button Component Variants
console.log('Test 2: Button Component Variants');
function testButtonVariants() {
  const buttonVariants = {
    default: "bg-primary text-primary-foreground shadow-xs hover:bg-primary/90",
    destructive: "bg-destructive text-white shadow-xs hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
    outline: "border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50",
    secondary: "bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80",
    ghost: "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
    link: "text-primary underline-offset-4 hover:underline"
  };

  const buttonSizes = {
    default: "h-9 px-4 py-2 has-[>svg]:px-3",
    sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
    lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
    icon: "size-9"
  };

  // Test variant classes
  const testVariants = ['default', 'destructive', 'outline'];
  testVariants.forEach(variant => {
    if (buttonVariants[variant] && buttonVariants[variant].includes('bg-')) {
      console.log(`✅ ${variant} variant has background class`);
    } else {
      console.log(`❌ ${variant} variant missing background class`);
    }
  });

  // Test size classes
  const testSizes = ['default', 'sm', 'lg', 'icon'];
  testSizes.forEach(size => {
    if (buttonSizes[size] && buttonSizes[size].includes('h-')) {
      console.log(`✅ ${size} size has height class`);
    } else {
      console.log(`❌ ${size} size missing height class`);
    }
  });

  console.log('');
}

// Test 3: ConversationModal Logic
console.log('Test 3: ConversationModal Logic');
function testConversationModal() {
  // Mock conversation data
  const mockThreads = [
    {
      id: '1',
      title: 'Test Conversation 1',
      messages: [{ content: 'Hello world!' }],
      timestamp: new Date().toISOString()
    },
    {
      id: '2',
      title: '',
      messages: [],
      timestamp: new Date().toISOString()
    },
    {
      id: '3',
      title: 'Very long conversation title that should be truncated',
      messages: [{ content: 'This is a very long message that should also be truncated for display purposes' }],
      timestamp: new Date().toISOString()
    }
  ];

  // Test title truncation logic
  function truncateTitle(title, maxLength = 40) {
    if (!title) return "Conversation";
    const trimmed = title.trim();
    const endsWithPunct = /[.!?]$/.test(trimmed);
    const truncated = trimmed.slice(0, maxLength);
    return truncated + (truncated.length === maxLength && !endsWithPunct ? "..." : "");
  }

  // Test message truncation logic
  function truncateMessage(messages, maxLength = 40) {
    if (messages.length === 0) return "No messages yet.";
    const lastMsg = messages[messages.length - 1].content;
    if (!lastMsg) return "No messages yet.";
    const trimmed = lastMsg.trim();
    const endsWithPunct = /[.!?]$/.test(trimmed);
    const truncated = trimmed.slice(0, maxLength);
    return truncated + (truncated.length === maxLength && !endsWithPunct ? "..." : "");
  }

  // Test cases
  const testCases = [
    {
      name: 'Normal title',
      title: mockThreads[0].title,
      expected: 'Test Conversation 1'
    },
    {
      name: 'Empty title',
      title: mockThreads[1].title,
      expected: 'Conversation'
    },
    {
      name: 'Long title',
      title: mockThreads[2].title,
      expected: 'Very long conversation title that should be truncat...'
    }
  ];

  testCases.forEach(testCase => {
    const result = truncateTitle(testCase.title);
    if (result === testCase.expected) {
      console.log(`✅ ${testCase.name} truncation correct`);
    } else {
      console.log(`❌ ${testCase.name} truncation failed: expected "${testCase.expected}", got "${result}"`);
    }
  });

  // Test message truncation
  const messageResult = truncateMessage(mockThreads[2].messages);
  if (messageResult.includes('...') && messageResult.length <= 43) {
    console.log('✅ Long message truncation working');
  } else {
    console.log('❌ Long message truncation failed');
  }

  // Test empty messages
  const emptyResult = truncateMessage(mockThreads[1].messages);
  if (emptyResult === "No messages yet.") {
    console.log('✅ Empty messages handling correct');
  } else {
    console.log('❌ Empty messages handling failed');
  }

  console.log('');
}

// Run all tests
try {
  testAgentBubble();
  testButtonVariants();
  testConversationModal();
  
  console.log('🎉 All tests completed!');
  console.log('\n📝 Note: These are basic logic tests. For full component testing,');
  console.log('   consider using React Testing Library with proper DOM rendering.');
} catch (error) {
  console.error('❌ Test failed with error:', error.message);
} 