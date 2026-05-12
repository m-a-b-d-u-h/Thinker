"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, XCircle, ArrowRight, RefreshCw } from "lucide-react";
import { modules } from "@/lib/dummy-data";
import { notFound } from "next/navigation";
import { use } from "react";

interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export default function QuizPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const module = modules.find((m) => m.slug === slug);
  
  if (!module || !module.questions) notFound();

  const questions: Question[] = module.questions;
  
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  const handleSelect = (index: number) => {
    if (showResult) return;
    setSelectedAnswer(index);
  };

  const handleNext = () => {
    if (selectedAnswer === null) return;

    const isCorrect = selectedAnswer === questions[currentQuestion].correctAnswer;
    if (isCorrect) setScore(s => s + 1);
    setShowResult(true);
  };

  const handleContinue = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(c => c + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    } else {
      setFinished(true);
    }
  };

  const handleRestart = () => {
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setScore(0);
    setFinished(false);
  };

  const percentage = Math.round((score / questions.length) * 100);

  return (
    <div className="mx-auto w-full max-w-[1200px] px-6 pb-[160px] pt-16">
      <div className="max-w-[700px] mx-auto">
        <header className="mb-12">
          <span className="badge" style={{ background: 'var(--color-c-mindset)', color: '#000', marginBottom: '1rem' }}>{module.category}</span>
          <h1 className="text-4xl font-bold text-white mt-4 mb-2">
            {module.title}
          </h1>
          <p className="text-lg text-[#666]">
            Test your understanding of this module
          </p>
        </header>

        {!finished ? (
          <div>
            <div className="mb-6">
              <span className="text-[0.875rem] text-[#444]">
                Question {currentQuestion + 1} of {questions.length}
              </span>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={currentQuestion}
                initial={{ opacity: 0, x: 5 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -5 }}
                transition={{ duration: 0.2 }}
              >
                <h2 className="text-2xl font-semibold text-white mb-8 leading-relaxed">
                  {questions[currentQuestion].question}
                </h2>

                <div className="flex flex-col gap-3">
                  {questions[currentQuestion].options.map((option, index) => {
                    const isSelected = selectedAnswer === index;
                    const isCorrect = index === questions[currentQuestion].correctAnswer;
                    let bg = 'bg-[#111]';
                    let border = 'border-[#222]';
                    let color = 'text-[#888]';

                    if (showResult) {
                      if (isCorrect) {
                        bg = 'bg-[#22c55e1a]';
                        border = 'border-[#22c55e]';
                        color = 'text-[#22c55e]';
                      } else if (isSelected && !isCorrect) {
                        bg = 'bg-[#ef44441a]';
                        border = 'border-[#ef4444]';
                        color = 'text-[#ef4444]';
                      }
                    } else if (isSelected) {
                      bg = 'bg-white/[0.05]';
                      border = 'border-white';
                      color = 'text-white';
                    }

                    return (
                      <button
                        key={index}
                        onClick={() => handleSelect(index)}
                        disabled={showResult}
                        className={`w-full text-left p-5 ${bg} border ${border} rounded-xl ${color} text-base cursor-pointer transition-all duration-200 hover:border-white/20 disabled:cursor-default flex items-center gap-4`}
                      >
                        {showResult && (
                          isCorrect ? <CheckCircle size={20} /> :
                          isSelected ? <XCircle size={20} /> : null
                        )}
                        <span>{option}</span>
                      </button>
                    );
                  })}
                </div>

                {showResult && (
                  <motion.div
                    initial={{ opacity: 0, y: 2.5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-6 p-5 bg-white/[0.03] rounded-xl border border-white/5"
                  >
                    <p className="text-[0.875rem] text-[#666] leading-relaxed">
                      {questions[currentQuestion].explanation}
                    </p>
                  </motion.div>
                )}

                <div className="mt-8 flex justify-end">
                  {!showResult ? (
                    <button
                      onClick={handleNext}
                      disabled={selectedAnswer === null}
                      className={`px-6 py-3.5 rounded-xl text-[0.9375rem] font-semibold transition-all duration-200 ${selectedAnswer === null ? 'bg-[#222] text-[#444] cursor-not-allowed' : 'bg-white text-black hover:opacity-90 cursor-pointer'}`}
                    >
                      Check Answer
                    </button>
                  ) : (
                    <button
                      onClick={handleContinue}
                      className="px-6 py-3.5 bg-white text-black rounded-xl text-[0.9375rem] font-semibold cursor-pointer hover:opacity-90 transition-opacity flex items-center gap-2"
                    >
                      {currentQuestion < questions.length - 1 ? 'Next Question' : 'See Results'}
                      <ArrowRight size={18} />
                    </button>
                  )}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center p-12 bg-[#111] rounded-2xl border border-[#222]"
          >
            <div className={`w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center ${percentage >= 80 ? 'bg-[#22c55e33]' : percentage >= 60 ? 'bg-[#fbbf2433]' : 'bg-[#ef444433]'}`}>
              <span className={`text-2xl font-bold ${percentage >= 80 ? 'text-[#22c55e]' : percentage >= 60 ? 'text-[#fbbf24]' : 'text-[#ef4444]'}`}>
                {percentage}%
              </span>
            </div>

            <h2 className="text-3xl font-bold text-white mb-2">
              {percentage >= 80 ? 'Excellent!' : percentage >= 60 ? 'Good effort!' : 'Keep practicing!'}
            </h2>

            <p className="text-base text-[#666] mb-8">
              You got {score} out of {questions.length} questions correct.
            </p>

            <button
              onClick={handleRestart}
              className="inline-flex items-center gap-2 px-6 py-3.5 bg-transparent text-[#888] border border-[#222] rounded-xl text-[0.9375rem] font-semibold cursor-pointer hover:text-white hover:border-white/20 transition-colors"
            >
              <RefreshCw size={18} />
              Retry Quiz
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
