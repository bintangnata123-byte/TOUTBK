import React, { useState, useEffect } from 'react';
import { SUBTESTS } from './data/tryoutConfig';
import questionsMeta from './data/questions_meta.json';
import StartScreen from './components/StartScreen';
import SubtestTransitionScreen from './components/SubtestTransitionScreen';
import ExamScreen from './components/ExamScreen';
import ResultScreen from './components/ResultScreen';

const STORAGE_KEY = 'cbt_utbk_session_state_v1';

export default function App() {
  const [screen, setScreen] = useState('start'); // 'start' | 'transition' | 'exam' | 'result'
  const [currentSubtestIndex, setCurrentSubtestIndex] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [participant, setParticipant] = useState({
    name: '',
    className: ''
  });

  // allAnswers: { [subtestId]: { [questionNumber]: answerString } }
  const [allAnswers, setAllAnswers] = useState(() => {
    const init = {};
    SUBTESTS.forEach(s => { init[s.id] = {}; });
    return init;
  });

  // timeRemaining: { [subtestId]: seconds }
  const [timeRemaining, setTimeRemaining] = useState(() => {
    const init = {};
    SUBTESTS.forEach(s => { init[s.id] = s.duration; });
    return init;
  });

  const [hasSavedProgress, setHasSavedProgress] = useState(false);

  // Check saved progress on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.screen && parsed.screen !== 'result') {
          setHasSavedProgress(true);
        }
      }
    } catch (e) {
      console.error('Error reading localStorage', e);
    }
  }, []);

  // Save progress periodically or on change
  useEffect(() => {
    if (screen === 'exam' || screen === 'transition') {
      try {
        const payload = {
          screen,
          currentSubtestIndex,
          currentQuestionIndex,
          allAnswers,
          timeRemaining,
          participant
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
      } catch (e) {
        console.error('Error saving state', e);
      }
    }
  }, [screen, currentSubtestIndex, currentQuestionIndex, allAnswers, timeRemaining, participant]);

  const currentSubtest = SUBTESTS[currentSubtestIndex] || SUBTESTS[0];
  const currentSubtestQuestions = questionsMeta[currentSubtest.id] || [];
  const currentSubtestAnswers = allAnswers[currentSubtest.id] || {};
  const currentSubtestTime = timeRemaining[currentSubtest.id] ?? currentSubtest.duration;

  // Countdown timer for active subtest
  useEffect(() => {
    if (screen !== 'exam') return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        const curr = prev[currentSubtest.id] ?? currentSubtest.duration;
        if (curr <= 1) {
          // Time is up! Auto advance to next subtest or result
          clearInterval(timer);
          handleTimeExpired();
          return { ...prev, [currentSubtest.id]: 0 };
        }
        return { ...prev, [currentSubtest.id]: curr - 1 };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [screen, currentSubtest.id]);

  const handleTimeExpired = () => {
    if (currentSubtestIndex < SUBTESTS.length - 1) {
      setScreen('transition');
    } else {
      setScreen('result');
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  const handleStartExam = (name, className) => {
    setParticipant({ name, className });
    setCurrentSubtestIndex(0);
    setCurrentQuestionIndex(0);
    setScreen('exam');
  };

  const handleResumeExam = () => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setScreen(parsed.screen || 'exam');
        setCurrentSubtestIndex(parsed.currentSubtestIndex || 0);
        setCurrentQuestionIndex(parsed.currentQuestionIndex || 0);
        setAllAnswers(parsed.allAnswers || {});
        setTimeRemaining(parsed.timeRemaining || {});
        if (parsed.participant) {
          setParticipant({
            name: parsed.participant.name || '',
            className: parsed.participant.className || parsed.participant.number || ''
          });
        }
      }
    } catch (e) {
      setScreen('exam');
    }
  };

  const handleResetExam = () => {
    localStorage.removeItem(STORAGE_KEY);
    setHasSavedProgress(false);
    const initAns = {};
    const initTime = {};
    SUBTESTS.forEach(s => {
      initAns[s.id] = {};
      initTime[s.id] = s.duration;
    });
    setAllAnswers(initAns);
    setTimeRemaining(initTime);
    setCurrentSubtestIndex(0);
    setCurrentQuestionIndex(0);
    setScreen('start');
  };

  const handleSaveAnswer = (questionNumber, answerValue) => {
    setAllAnswers((prev) => ({
      ...prev,
      [currentSubtest.id]: {
        ...prev[currentSubtest.id],
        [questionNumber]: answerValue
      }
    }));
  };

  const handleSubmitSubtest = () => {
    if (currentSubtestIndex < SUBTESTS.length - 1) {
      setScreen('transition');
    } else {
      setScreen('result');
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  const handleStartNextSubtest = () => {
    const nextIdx = currentSubtestIndex + 1;
    setCurrentSubtestIndex(nextIdx);
    setCurrentQuestionIndex(0);
    setScreen('exam');
  };

  return (
    <div className="w-full min-h-screen bg-slate-100 font-sans">
      {screen === 'start' && (
        <StartScreen
          onStartExam={handleStartExam}
          hasSavedProgress={hasSavedProgress}
          onResumeExam={handleResumeExam}
          onResetExam={handleResetExam}
        />
      )}

      {screen === 'transition' && (
        <SubtestTransitionScreen
          previousSubtest={SUBTESTS[currentSubtestIndex]}
          nextSubtest={SUBTESTS[currentSubtestIndex + 1]}
          nextIndex={currentSubtestIndex + 1}
          totalSubtests={SUBTESTS.length}
          onStartNextSubtest={handleStartNextSubtest}
        />
      )}

      {screen === 'exam' && (
        <ExamScreen
          subtest={currentSubtest}
          questions={currentSubtestQuestions}
          currentQuestionIndex={currentQuestionIndex}
          onSelectQuestion={setCurrentQuestionIndex}
          answers={currentSubtestAnswers}
          onSaveAnswer={handleSaveAnswer}
          timeRemaining={currentSubtestTime}
          onSubmitSubtest={handleSubmitSubtest}
          isLastSubtest={currentSubtestIndex === SUBTESTS.length - 1}
          participantName={participant.name}
          participantClass={participant.className || participant.number}
        />
      )}

      {screen === 'result' && (
        <ResultScreen
          allAnswers={allAnswers}
          questionsMeta={questionsMeta}
          participantName={participant.name}
          participantClass={participant.className || participant.number}
          onResetExam={handleResetExam}
        />
      )}
    </div>
  );
}
