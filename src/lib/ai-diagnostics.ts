import { Configuration, OpenAIApi } from 'openai';
import { supabase } from './supabase';
import * as tf from '@tensorflow/tfjs';

interface ErrorPattern {
  type: string;
  symptoms: string[];
  solutions: string[];
}

class AIDiagnostics {
  private openai: OpenAIApi;
  private model: tf.LayersModel | null = null;
  private errorPatterns: ErrorPattern[] = [];

  constructor() {
    const configuration = new Configuration({
      apiKey: import.meta.env.VITE_OPENAI_API_KEY
    });
    this.openai = new OpenAIApi(configuration);
    this.initializeModel();
  }

  private async initializeModel() {
    try {
      // Load pre-trained model for error classification
      this.model = await tf.loadLayersModel('/models/error-classifier/model.json');
      
      // Load error patterns
      const { data: patterns } = await supabase
        .from('error_patterns')
        .select('*');
      
      if (patterns) {
        this.errorPatterns = patterns;
      }
    } catch (error) {
      console.error('Error initializing AI model:', error);
    }
  }

  async analyzeMachineMetrics(machineId: string, metrics: any) {
    try {
      // Prepare metrics for analysis
      const tensorData = tf.tensor2d([
        [
          metrics.cpu_usage,
          metrics.memory_usage,
          metrics.disk_usage,
          metrics.network_usage || 0
        ]
      ]);

      // Get model prediction
      const prediction = this.model?.predict(tensorData) as tf.Tensor;
      const errorProbabilities = await prediction.array();
      
      // Get highest probability error type
      const maxProbIndex = errorProbabilities[0].indexOf(Math.max(...errorProbabilities[0]));
      const errorType = this.errorPatterns[maxProbIndex]?.type;

      if (!errorType) return null;

      // Get detailed analysis from OpenAI
      const analysis = await this.getDetailedAnalysis(metrics, errorType);

      // Store diagnostic
      const { data: diagnostic } = await supabase
        .from('ai_diagnostics')
        .insert({
          machine_id: machineId,
          error_type: errorType,
          description: analysis.description,
          solution: analysis.solution,
          confidence: errorProbabilities[0][maxProbIndex]
        })
        .select()
        .single();

      return diagnostic;
    } catch (error) {
      console.error('Error analyzing machine metrics:', error);
      throw error;
    }
  }

  private async getDetailedAnalysis(metrics: any, errorType: string) {
    const prompt = `
      Analyze the following machine metrics and provide a detailed diagnosis and solution:
      CPU Usage: ${metrics.cpu_usage}%
      Memory Usage: ${metrics.memory_usage}%
      Disk Usage: ${metrics.disk_usage}%
      Error Type: ${errorType}
    `;

    const response = await this.openai.createCompletion({
      model: "gpt-4",
      prompt,
      max_tokens: 500
    });

    const analysis = response.data.choices[0]?.text || '';
    const [description, solution] = analysis.split('\nSolution:');

    return {
      description: description.trim(),
      solution: solution?.trim() || 'No solution provided'
    };
  }

  async getRecommendations(machineId: string) {
    try {
      const { data: metrics } = await supabase
        .from('machine_metrics')
        .select('*')
        .eq('machine_id', machineId)
        .order('timestamp', { ascending: false })
        .limit(10);

      if (!metrics?.length) return [];

      const prompt = `
        Based on these recent metrics, suggest optimizations:
        ${JSON.stringify(metrics, null, 2)}
      `;

      const response = await this.openai.createCompletion({
        model: "gpt-4",
        prompt,
        max_tokens: 300
      });

      return response.data.choices[0]?.text?.split('\n').filter(Boolean) || [];
    } catch (error) {
      console.error('Error getting recommendations:', error);
      return [];
    }
  }
}

export const aiDiagnostics = new AIDiagnostics();