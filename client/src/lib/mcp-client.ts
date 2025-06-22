/**
 * MCP Client for English Checkpoint Truck Driver App
 * Provides integration with MCP tools for enhanced functionality
 */

interface MCPTool {
  name: string;
  description: string;
  parameters: Record<string, any>;
}

interface MCPResponse {
  content: Array<{
    type: string;
    text: string;
  }>;
  isError?: boolean;
}

export class MCPClient {
  private serverUrl: string;
  
  constructor(serverUrl: string = 'http://localhost:3003/api/mcp') {
    this.serverUrl = serverUrl;
  }

  /**
   * Get available MCP tools
   */
  async getAvailableTools(): Promise<MCPTool[]> {
    try {
      const response = await fetch(`${this.serverUrl}/tools`);
      const data = await response.json();
      return data.tools || [];
    } catch (error) {
      console.error('Failed to get MCP tools:', error);
      return [];
    }
  }

  /**
   * Call an MCP tool
   */
  async callTool(toolName: string, parameters: Record<string, any>): Promise<MCPResponse> {
    try {
      const response = await fetch(`${this.serverUrl}/call`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tool: toolName,
          parameters
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Failed to call MCP tool ${toolName}:`, error);
      return {
        content: [{
          type: 'text',
          text: `Error calling ${toolName}: ${error instanceof Error ? error.message : 'Unknown error'}`
        }],
        isError: true
      };
    }
  }

  /**
   * Get DOT regulations
   */
  async getDOTRegulations(category: string, state?: string): Promise<string> {
    const response = await this.callTool('get_dot_regulations', { category, state });
    return response.content[0]?.text || 'No regulation data available';
  }

  /**
   * Track learning progress
   */
  async trackLearningProgress(
    userId: string, 
    lessonType: string, 
    score: number, 
    duration?: number
  ): Promise<string> {
    const response = await this.callTool('track_learning_progress', {
      user_id: userId,
      lesson_type: lessonType,
      score,
      duration
    });
    return response.content[0]?.text || 'Progress tracking failed';
  }

  /**
   * Get trucking vocabulary
   */
  async getTruckingVocabulary(
    category: string, 
    difficulty: string = 'intermediate', 
    count: number = 10
  ): Promise<string> {
    const response = await this.callTool('get_trucking_vocabulary', {
      category,
      difficulty,
      count
    });
    return response.content[0]?.text || 'No vocabulary available';
  }

  /**
   * Get checkpoint scenarios
   */
  async getCheckpointScenarios(
    scenarioType: string, 
    difficulty: string = 'intermediate'
  ): Promise<string> {
    const response = await this.callTool('get_checkpoint_scenarios', {
      scenario_type: scenarioType,
      difficulty
    });
    return response.content[0]?.text || 'No scenarios available';
  }

  /**
   * Analyze pronunciation
   */
  async analyzePronunciation(
    audioText: string, 
    targetText: string, 
    language?: string
  ): Promise<string> {
    const response = await this.callTool('analyze_pronunciation', {
      audio_text: audioText,
      target_text: targetText,
      language
    });
    return response.content[0]?.text || 'Pronunciation analysis failed';
  }
}

// Create singleton instance
export const mcpClient = new MCPClient();

// Hook for React components
export const useMCP = () => {
  return {
    getDOTRegulations: mcpClient.getDOTRegulations.bind(mcpClient),
    trackLearningProgress: mcpClient.trackLearningProgress.bind(mcpClient),
    getTruckingVocabulary: mcpClient.getTruckingVocabulary.bind(mcpClient),
    getCheckpointScenarios: mcpClient.getCheckpointScenarios.bind(mcpClient),
    analyzePronunciation: mcpClient.analyzePronunciation.bind(mcpClient),
  };
};