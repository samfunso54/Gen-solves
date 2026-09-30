import React, { useState } from 'react';
import { MathView } from './MathView';
import { SolvedMathData } from './SolutionResultView';
import { Search, ChevronRight, Layers, ArrowUpDown, Filter } from 'lucide-react';

interface ContractLedgerProps {
  records: SolvedMathData[];
  onSelectRecord: (record: SolvedMathData) => void;
}

export const ContractLedger: React.FC<ContractLedgerProps> = ({
  records,
  onSelectRecord,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = ['all', ...Array.from(new Set(records.map((r) => r.solution.category)))];

  const filteredRecords = records.filter((r) => {
    const matchesCategory =
      selectedCategory === 'all' || r.solution.category === selectedCategory;
    const matchesSearch =
      searchTerm === '' ||
      r.solution.problem_raw.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.solution.final_answer_text.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.genlayer_consensus.txHash.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.genlayer_consensus.blockHeight.toString().includes(searchTerm);
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="flex flex-col gap-4">
      {/* Controls Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 rounded-xl bg-neutral-900/80 border border-neutral-800">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search problems, answers, or block numbers..."
            className="w-full pl-9 pr-4 py-1.5 text-xs bg-neutral-950 border border-neutral-800 rounded-lg text-neutral-200 placeholder:text-neutral-500 focus:outline-none focus:border-emerald-500/50"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          <Filter className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-2.5 py-1 text-xs font-medium rounded-lg whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'text-neutral-400 hover:text-neutral-200 bg-neutral-950/60 border border-neutral-800/80'
              }`}
            >
              {cat === 'all' ? 'All Disciplines' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Ledger Table */}
      <div className="rounded-xl border border-neutral-800 bg-neutral-900/80 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-950/80 text-neutral-400 border-b border-neutral-800 font-medium">
              <tr>
                <th className="py-3 px-4">Block & Time</th>
                <th className="py-3 px-4">Discipline</th>
                <th className="py-3 px-4">Mathematical Problem</th>
                <th className="py-3 px-4">Canonical Answer</th>
                <th className="py-3 px-4 text-right">Consensus</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/60">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-neutral-500">
                    <Layers className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    No math records match the current filter.
                  </td>
                </tr>
              ) : (
                filteredRecords.map((item, idx) => (
                  <tr
                    key={idx}
                    onClick={() => onSelectRecord(item)}
                    className="hover:bg-neutral-800/50 cursor-pointer transition-colors group"
                  >
                    <td className="py-3.5 px-4 font-mono whitespace-nowrap">
                      <div className="text-neutral-200 font-semibold tabular-nums">
                        #{item.genlayer_consensus.blockHeight}
                      </div>
                      <div className="text-[11px] text-neutral-500">
                        {new Date(item.genlayer_consensus.timestamp).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="text-neutral-300 font-medium">{item.solution.category}</span>
                      {item.solution.difficulty && (
                        <div className="text-[11px] text-neutral-500">{item.solution.difficulty}</div>
                      )}
                    </td>

                    <td className="py-3.5 px-4 max-w-xs truncate">
                      <div className="text-neutral-200 truncate font-mono">
                        <MathView math={item.solution.problem_latex} />
                      </div>
                      <div className="text-[11px] text-neutral-400 truncate mt-0.5">
                        {item.solution.problem_raw}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="text-emerald-400 font-semibold font-mono">
                        <MathView math={item.solution.final_answer_latex} />
                      </div>
                      <div className="text-[11px] text-neutral-400 truncate max-w-xs">
                        {item.solution.final_answer_text}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-right whitespace-nowrap font-mono tabular-nums">
                      <span className="text-emerald-400 font-medium">5/5 Nodes</span>
                      <div className="text-[11px] text-neutral-500">100% Agreement</div>
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <button className="p-1.5 rounded-lg text-neutral-400 group-hover:text-emerald-400 group-hover:bg-emerald-500/10 transition-colors">
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
