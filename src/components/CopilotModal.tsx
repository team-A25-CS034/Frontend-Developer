import { useState } from 'react';
import { X, Send, Mic, Download, Trash2, Bot } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { ScrollArea } from './ui/scroll-area';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';

interface CopilotModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  type?: 'text' | 'table';
  tableData?: any[];
}

const examplePrompts = [
  'Which machines need immediate attention?',
  'Show me maintenance history for M003',
  'What are the top risk factors this week?',
  'Predict failures in the next 30 days',
];

const mockTableResponse = [
  { machine: 'Motor Drive C-33', risk: 87, issue: 'High vibration', eta: '3-5 days' },
  { machine: 'Compressor B-04', risk: 58, issue: 'Temperature rising', eta: '7-10 days' },
];

export default function CopilotModal({ isOpen, onClose }: CopilotModalProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Hello! I\'m your Predictive Maintenance Copilot. I can help you analyze machine conditions, predict failures, and provide maintenance recommendations. How can I assist you today?',
    },
  ]);
  const [inputValue, setInputValue] = useState('');

  const handleSend = () => {
    if (!inputValue.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue,
    };
    setMessages((prev) => [...prev, userMessage]);

    // Simulate AI response
    setTimeout(() => {
      const isTableQuery = inputValue.toLowerCase().includes('which') || 
                          inputValue.toLowerCase().includes('show') ||
                          inputValue.toLowerCase().includes('list');
      
      let assistantMessage: Message;
      
      if (isTableQuery) {
        assistantMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: 'Based on current sensor data and predictive models, here are the machines requiring attention:',
          type: 'table',
          tableData: mockTableResponse,
        };
      } else {
        assistantMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: 'Based on the analysis of your fleet, I recommend prioritizing Motor Drive C-33 for maintenance. The vibration levels have increased 40% over the past week, and the predictive model indicates a 73% probability of failure within the next 7 days. I suggest scheduling an inspection to check the bearing alignment and lubrication system.',
        };
      }
      
      setMessages((prev) => [...prev, assistantMessage]);
    }, 1000);

    setInputValue('');
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: '1',
        role: 'assistant',
        content: 'Hello! I\'m your Predictive Maintenance Copilot. I can help you analyze machine conditions, predict failures, and provide maintenance recommendations. How can I assist you today?',
      },
    ]);
  };

  const handleExportChat = () => {
    const chatText = messages
      .map((m) => `${m.role === 'user' ? 'You' : 'Copilot'}: ${m.content}`)
      .join('\n\n');
    const blob = new Blob([chatText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `copilot-chat-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-3xl h-[80vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-slate-900">AI Copilot</h2>
              <p className="text-slate-600">Predictive Maintenance Assistant</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleExportChat}
              title="Export chat"
            >
              <Download className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearChat}
              title="Clear chat"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 p-6">
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-4 ${
                    message.role === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 text-slate-900'
                  }`}
                >
                  <p>{message.content}</p>
                  
                  {message.type === 'table' && message.tableData && (
                    <div className="mt-4 bg-white rounded border border-slate-200 overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="text-slate-900">Machine</TableHead>
                            <TableHead className="text-slate-900">Risk</TableHead>
                            <TableHead className="text-slate-900">Issue</TableHead>
                            <TableHead className="text-slate-900">ETA</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {message.tableData.map((row, idx) => (
                            <TableRow key={idx}>
                              <TableCell>{row.machine}</TableCell>
                              <TableCell>
                                <span className={row.risk >= 70 ? 'text-red-600' : 'text-yellow-600'}>
                                  {row.risk}
                                </span>
                              </TableCell>
                              <TableCell>{row.issue}</TableCell>
                              <TableCell>{row.eta}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        {/* Example Prompts */}
        {messages.length === 1 && (
          <div className="px-6 pb-4">
            <p className="text-slate-600 mb-2">Try asking:</p>
            <div className="flex flex-wrap gap-2">
              {examplePrompts.map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => setInputValue(prompt)}
                  className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div className="p-6 border-t border-slate-200">
          <div className="flex gap-2">
            <Input
              placeholder="Ask about machines, predictions, or maintenance..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              className="flex-1"
            />
            <Button
              variant="outline"
              size="icon"
              title="Voice input"
            >
              <Mic className="w-4 h-4" />
            </Button>
            <Button
              onClick={handleSend}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
