/**
 * Human Agent Evolution Example
 * 
 * This example demonstrates how to use the HumanAgent with self-building functions
 * inspired by BabyAGI. It shows how agents can create, improve, and execute
 * dynamically generated functions.
 */

import { HumanAgent, HumanProfile } from '../agents/HumanAgent';

async function runExample() {
  console.log('Starting Human Agent Evolution Example');
  console.log('--------------------------------------');
  
  // Create a human profile
  const profile: HumanProfile = {
    name: 'Alex',
    expertise: ['JavaScript', 'Machine Learning', 'Data Analysis'],
    interests: ['AI Ethics', 'Autonomous Agents', 'Knowledge Graphs'],
    learningGoals: ['Improve reasoning capabilities', 'Master function generation', 'Build knowledge graph applications'],
    preferences: {
      learningStyle: 'hands-on',
      communicationStyle: 'detailed',
      workingHours: 'morning'
    }
  };
  
  // Create a human agent
  console.log('Creating human agent with profile:', profile.name);
  const agent = new HumanAgent('human-1', profile.name, profile);
  
  // Create a learning path
  console.log('\nCreating learning path for agent evolution');
  const learningPath = agent.createLearningPath(
    'Agent Evolution Mastery',
    'Learning path for mastering agent evolution and self-improvement techniques',
    [
      'Generate useful functions dynamically',
      'Improve functions based on feedback',
      'Build a knowledge graph of capabilities'
    ]
  );
  
  console.log('Created learning path:', learningPath.name);
  console.log('Goals:', learningPath.goals);
  
  // Generate a function
  console.log('\nGenerating a new function for data analysis');
  const functionId = await agent.createFunction(
    'Analyze text sentiment',
    [
      'Extract sentiment from text',
      'Identify key entities',
      'Summarize main points'
    ]
  );
  
  console.log('Generated function ID:', functionId);
  
  // Execute the function
  console.log('\nExecuting the generated function');
  const executionResult = await agent.executeFunction(functionId, {
    text: 'I really enjoyed the conference on AI ethics yesterday. The speakers were knowledgeable and the discussions were thought-provoking.'
  });
  
  console.log('Execution result:', executionResult);
  
  // Improve the function
  console.log('\nImproving the function with additional capabilities');
  const improvedFunctionId = await agent.improveFunction(functionId, [
    'Add emotion detection',
    'Improve accuracy with context awareness',
    'Add confidence scores to results'
  ]);
  
  console.log('Improved function ID:', improvedFunctionId);
  
  // Execute the improved function
  console.log('\nExecuting the improved function');
  const improvedResult = await agent.executeFunction(improvedFunctionId, {
    text: 'I really enjoyed the conference on AI ethics yesterday. The speakers were knowledgeable and the discussions were thought-provoking.'
  });
  
  console.log('Improved execution result:', improvedResult);
  
  // Search and generate a function
  console.log('\nSearching for information and generating a function');
  const searchFunctionId = await agent.searchAndGenerateFunction('autonomous agent coordination techniques');
  
  console.log('Generated function from search:', searchFunctionId);
  
  // Get learning path progress
  console.log('\nChecking learning path progress');
  const updatedPath = agent.getLearningPath(learningPath.id);
  console.log('Learning path progress:', updatedPath?.progress);
  
  // Get functions in learning path
  console.log('\nFunctions in learning path:');
  const pathFunctions = agent.getLearningPathFunctions(learningPath.id);
  
  for (const func of pathFunctions) {
    console.log(`- ${func.template.name} (v${func.version}): ${func.template.description}`);
  }
  
  // Get next step suggestions
  console.log('\nSuggested next steps:');
  const suggestions = agent.suggestNextSteps();
  
  for (const suggestion of suggestions.slice(0, 5)) {
    console.log(`- ${suggestion}`);
  }
  
  // Get knowledge visualization
  console.log('\nKnowledge graph visualization available');
  const visualization = agent.getKnowledgeVisualization();
  console.log(`Graph contains ${visualization.nodes.length} nodes and ${visualization.edges.length} edges`);
  
  console.log('\nExample completed successfully');
}

// Run the example
runExample().catch(error => {
  console.error('Error running example:', error);
});

export default runExample;