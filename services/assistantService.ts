import { geminiModel } from './geminiClient';
import { evaluateTokens } from '../calculator/mathEngine';
import type { Token } from '../calculator/mathEngine';
import { SchemaType, FunctionCallingMode } from '@google/generative-ai';
import type { Tool, Content } from '@google/generative-ai';

export type AssistantMessageRole = 'user' | 'assistant';

export interface AssistantMessage {
  role: AssistantMessageRole;
  content: string;
}

export type AssistantResultType =
  | { type: 'result'; value: string; steps?: string[] | undefined }
  | { type: 'out_of_scope' }
  | { type: 'error'; message: string };

// ─── Function schemas ────────────────────────────────────────────────────────

const TOOLS: Tool[] = [
  {
    functionDeclarations: [
      {
        name: 'evaluate_expression',
        description:
          'Evaluate a mathematical expression. Use for arithmetic, algebra, percentages, and scientific calculations.',
        parameters: {
          type: SchemaType.OBJECT,
          properties: {
            tokens: {
              type: SchemaType.ARRAY,
              description:
                'The expression as a flat token list. Each token has a "type" ("number", "op", or "paren") and a "value" string. Operators: +, -, ×, ÷.',
              items: {
                type: SchemaType.OBJECT,
                properties: {
                  type: { type: SchemaType.STRING },
                  value: { type: SchemaType.STRING },
                },
              },
            },
            steps: {
              type: SchemaType.ARRAY,
              description:
                'Optional step-by-step explanation. Include when the user asks "how", "why", or "explain".',
              items: { type: SchemaType.STRING },
            },
          },
          required: ['tokens'],
        },
      },
      {
        name: 'split_and_tip',
        description: 'Split a bill among people, optionally adding a tip.',
        parameters: {
          type: SchemaType.OBJECT,
          properties: {
            total: { type: SchemaType.NUMBER, description: 'The total bill amount.' },
            people: { type: SchemaType.NUMBER, description: 'Number of people splitting the bill.' },
            tip_percent: {
              type: SchemaType.NUMBER,
              description: 'Tip percentage to add before splitting (0 if no tip).',
            },
            steps: {
              type: SchemaType.ARRAY,
              description: 'Optional step-by-step breakdown.',
              items: { type: SchemaType.STRING },
            },
          },
          required: ['total', 'people', 'tip_percent'],
        },
      },
      {
        name: 'unit_conversion',
        description: 'Convert a value from one unit to another.',
        parameters: {
          type: SchemaType.OBJECT,
          properties: {
            value: { type: SchemaType.NUMBER, description: 'The numeric value to convert.' },
            from_unit: { type: SchemaType.STRING, description: 'The unit to convert from (e.g. "miles").' },
            to_unit: { type: SchemaType.STRING, description: 'The unit to convert to (e.g. "kilometers").' },
            steps: {
              type: SchemaType.ARRAY,
              description: 'Optional step-by-step breakdown.',
              items: { type: SchemaType.STRING },
            },
          },
          required: ['value', 'from_unit', 'to_unit'],
        },
      },
      {
        name: 'out_of_scope',
        description:
          "Call this when the user's request is not related to math, calculations, unit conversions, or numerical reasoning.",
        parameters: {
          type: SchemaType.OBJECT,
          properties: {
            reason: {
              type: SchemaType.STRING,
              description: 'Brief internal note on why the request is out of scope.',
            },
          },
          required: ['reason'],
        },
      },
    ],
  },
];

// ─── Calculation handlers ────────────────────────────────────────────────────

function handleEvaluateExpression(args: {
  tokens: Token[];
  steps?: string[];
}): AssistantResultType {
  const value = evaluateTokens(args.tokens);
  if (value === 'Error') {
    return { type: 'error', message: 'Could not evaluate that expression.' };
  }
  return { type: 'result', value, steps: args.steps };
}

function handleSplitAndTip(args: {
  total: number;
  people: number;
  tip_percent: number;
  steps?: string[];
}): AssistantResultType {
  if (args.people <= 0) {
    return { type: 'error', message: 'Number of people must be greater than zero.' };
  }
  const withTip = args.total * (1 + args.tip_percent / 100);
  const perPerson = withTip / args.people;
  return { type: 'result', value: perPerson.toFixed(2), steps: args.steps };
}

const UNIT_FACTORS: Record<string, Record<string, number>> = {
  miles: { kilometers: 1.60934, meters: 1609.34, feet: 5280 },
  kilometers: { miles: 0.621371, meters: 1000, feet: 3280.84 },
  meters: { feet: 3.28084, kilometers: 0.001, miles: 0.000621371 },
  feet: { meters: 0.3048, miles: 0.000189394, kilometers: 0.0003048 },
  kilograms: { pounds: 2.20462, grams: 1000, ounces: 35.274 },
  pounds: { kilograms: 0.453592, grams: 453.592, ounces: 16 },
  grams: { kilograms: 0.001, pounds: 0.00220462 },
  ounces: { pounds: 0.0625, grams: 28.3495, kilograms: 0.0283495 },
};

function handleUnitConversion(args: {
  value: number;
  from_unit: string;
  to_unit: string;
  steps?: string[];
}): AssistantResultType {
  const from = args.from_unit.toLowerCase();
  const to = args.to_unit.toLowerCase();

  if (from === 'celsius' && to === 'fahrenheit')
    return { type: 'result', value: ((args.value * 9) / 5 + 32).toFixed(2), steps: args.steps };
  if (from === 'fahrenheit' && to === 'celsius')
    return { type: 'result', value: (((args.value - 32) * 5) / 9).toFixed(2), steps: args.steps };
  if (from === 'celsius' && to === 'kelvin')
    return { type: 'result', value: (args.value + 273.15).toFixed(2), steps: args.steps };
  if (from === 'kelvin' && to === 'celsius')
    return { type: 'result', value: (args.value - 273.15).toFixed(2), steps: args.steps };

  const factor = UNIT_FACTORS[from]?.[to];
  if (factor === undefined) {
    return { type: 'error', message: `Don't know how to convert ${args.from_unit} to ${args.to_unit}.` };
  }
  return {
    type: 'result',
    value: (args.value * factor).toFixed(6).replace(/\.?0+$/, ''),
    steps: args.steps,
  };
}

// ─── System prompt ────────────────────────────────────────────────────────────

const SYSTEM_PROMPT =
  'You are a math assistant embedded in a calculator app. ' +
  'You ONLY handle requests related to arithmetic, algebra, unit conversions, bill splitting, percentages, and other numerical calculations. ' +
  'Always call one of the provided functions — never respond with plain text. ' +
  "If the user's request is not about math or numbers, call out_of_scope.";

// ─── Public API ───────────────────────────────────────────────────────────────

export async function sendMessage(
  userMessage: string,
  history: AssistantMessage[],
): Promise<AssistantResultType> {
  // Gemini uses 'model' instead of 'assistant' for the AI role
  const geminiHistory: Content[] = history.map((m) => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }],
  }));

  try {
    const chat = geminiModel.startChat({
      history: geminiHistory,
      tools: TOOLS,
      toolConfig: { functionCallingConfig: { mode: FunctionCallingMode.ANY } },
      systemInstruction: SYSTEM_PROMPT,
    });

    const result = await chat.sendMessage(userMessage);
    const part = result.response.candidates?.[0]?.content?.parts?.[0];

    if (!part?.functionCall) {
      return { type: 'error', message: 'No response from assistant.' };
    }

    const { name, args } = part.functionCall;

    switch (name) {
      case 'evaluate_expression':
        return handleEvaluateExpression(args as Parameters<typeof handleEvaluateExpression>[0]);
      case 'split_and_tip':
        return handleSplitAndTip(args as Parameters<typeof handleSplitAndTip>[0]);
      case 'unit_conversion':
        return handleUnitConversion(args as Parameters<typeof handleUnitConversion>[0]);
      case 'out_of_scope':
        return { type: 'out_of_scope' };
      default:
        return { type: 'error', message: 'Unknown function called.' };
    }
  } catch (err) {
    return { type: 'error', message: err instanceof Error ? err.message : 'Unknown error.' };
  }
}