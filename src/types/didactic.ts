export type EducationLevel =
  | 'primaria'
  | 'secundaria'
  | 'preparatoria'
  | 'universidad'
  | 'autoaprendizaje';

export type LearningFocus = 'aprender' | 'ensenar' | 'ambos';

export interface ConceptStage {
  stageNumber: number;
  title: string;
  summary: string;
  keyTakeaway: string;
}

export interface ConceptNode {
  id: string;
  title: string;
  shortLabel: string;
  stage: number;
  simpleExplanation: string;
  everydayAnalogy: string;
  documentExample: string;
  teachingTip: string;
  commonMisconception: string;
  keyPoints?: string[];
  connectsTo: string[];
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  difficulty: 'basico' | 'intermedio' | 'reto';
}

export interface MatchPair {
  id: string;
  term: string;
  definition: string;
  category: string;
}

export interface SequenceStep {
  id: string;
  order: number;
  title: string;
  description: string;
}

export interface SequenceChallenge {
  title: string;
  instruction: string;
  steps: SequenceStep[];
}

export interface ClozeItem {
  id: string;
  beforeBlank: string;
  blankAnswer: string;
  afterBlank: string;
  hint: string;
}

export interface TrueFalseItem {
  id: string;
  statement: string;
  isTrue: boolean;
  explanation: string;
}

export interface CategoryBucket {
  id: string;
  name: string;
}

export interface CategorySortItem {
  id: string;
  label: string;
  categoryId: string;
  hint: string;
}

export interface CategorySortChallenge {
  title: string;
  instruction: string;
  categories: CategoryBucket[];
  items: CategorySortItem[];
}

export interface FlashcardItem {
  id: string;
  front: string;
  back: string;
  analogy: string;
  hint: string;
}

export interface TeachingMethod {
  id: string;
  name: string;
  durationMinutes: number;
  bestFor: string;
  objective: string;
  steps: string[];
  materialsNeeded: string[];
}

export interface LessonAct {
  actNumber: number;
  title: string;
  durationMinutes: number;
  teacherAction: string;
  studentActivity: string;
}

export interface DidacticKit {
  id: string;
  libraryId?: string;
  savedAt?: string;
  sourceFileName: string;
  sourceType: 'pdf' | 'word' | 'texto' | 'ejemplo';
  sourceTextContext?: string;
  subjectTitle: string;
  discipline: string;
  level: EducationLevel;
  focus: LearningFocus;
  estimatedStudyMinutes: number;
  executiveSummary: string;
  bigIdea: string;
  stages: ConceptStage[];
  concepts: ConceptNode[];
  quiz: QuizQuestion[];
  matchPairs: MatchPair[];
  sequenceChallenge: SequenceChallenge;
  clozeExercises: ClozeItem[];
  trueFalseItems: TrueFalseItem[];
  categorySortGame: CategorySortChallenge;
  flashcards: FlashcardItem[];
  feynmanGuide: {
    childLevelExplanation: string;
    socraticQuestions: string[];
    realWorldHook: string;
  };
  teachingMethods: TeachingMethod[];
  lessonPlanActs: LessonAct[];
  exitTicketQuestions: string[];
}

export interface SavedLibraryItem {
  id: string;
  fileName: string;
  mimeType: string;
  fileSize: number;
  sourceType: 'pdf' | 'word' | 'texto' | 'ejemplo';
  savedAt: string;
  hasOriginalFile: boolean;
  kit: DidacticKit;
}

export interface SessionProgress {
  exploredConceptIds: string[];
  quizBestScore: number | null;
  quizTotalQuestions: number;
  pairsSolved: boolean;
  sequenceSolved: boolean;
  clozeSolvedCount: number;
  trueFalseBest: number | null;
  categorySortSolved: boolean;
  wordGuessSolvedCount: number;
  masteredFlashcardIds: string[];
}

export const LEVEL_LABELS: Record<EducationLevel, string> = {
  primaria: 'Primaria',
  secundaria: 'Secundaria',
  preparatoria: 'Preparatoria',
  universidad: 'Universidad',
  autoaprendizaje: 'Autoaprendizaje',
};

export const FOCUS_LABELS: Record<LearningFocus, string> = {
  aprender: 'Para estudiar y memorizar',
  ensenar: 'Para enseñar en clase',
  ambos: 'Aprender y enseñar',
};
