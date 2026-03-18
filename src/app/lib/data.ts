
import { Question, LessonModule } from './types';

export const MOCK_QUESTIONS: Question[] = [
  {
    id: 'q1',
    text: 'What should you do when you see a "Stop" sign at a junction?',
    options: [
      'Slow down and proceed if clear',
      'Come to a complete stop behind the line',
      'Stop only if there is traffic approaching',
      'Flash your lights and continue'
    ],
    correctAnswer: 'Come to a complete stop behind the line',
    category: 'Road Signs'
  },
  {
    id: 'q2',
    text: 'What is the national speed limit for a car on a single carriageway road?',
    options: ['40 mph', '50 mph', '60 mph', '70 mph'],
    correctAnswer: '60 mph',
    category: 'Rules of the Road'
  },
  {
    id: 'q3',
    text: 'You are driving behind a large vehicle. Why should you keep well back?',
    options: [
      'To allow others to overtake you',
      'To keep out of the wind',
      'To allow the driver to see you in their mirrors',
      'To see the traffic lights more clearly'
    ],
    correctAnswer: 'To allow the driver to see you in their mirrors',
    category: 'Safety'
  },
  {
    id: 'q4',
    text: 'What does a circular road sign with a red border and a number inside mean?',
    options: [
      'Maximum speed limit',
      'Recommended speed',
      'Minimum speed limit',
      'Distance to the next town'
    ],
    correctAnswer: 'Maximum speed limit',
    category: 'Road Signs'
  },
  {
    id: 'q5',
    text: 'When may you use the right-hand lane on a three-lane motorway?',
    options: [
      'When you are driving faster than 70 mph',
      'When you are overtaking',
      'When the other lanes are busy',
      'Always, as long as you dont hold up traffic'
    ],
    correctAnswer: 'When you are overtaking',
    category: 'Motorway'
  }
];

export const MOCK_LESSONS: LessonModule[] = [
  {
    id: 'm1',
    title: 'Alertness',
    description: 'Master the core concepts of staying alert and aware on the road.',
    icon: 'Eye',
    content: 'Alertness is the foundation of safe driving. It involves being aware of your surroundings at all times...',
    progress: 100
  },
  {
    id: 'm2',
    title: 'Road & Traffic Signs',
    description: 'Learn to identify and interpret all mandatory and warning road signs.',
    icon: 'Navigation',
    content: 'Road signs in the UK are categorised into three main types: Warning, Regulatory, and Informational...',
    progress: 65
  },
  {
    id: 'm3',
    title: 'Hazard Perception',
    description: 'Identify potential and developing hazards before they become dangerous.',
    icon: 'AlertTriangle',
    content: 'Developing hazard perception skills is crucial. A hazard is anything that might cause you to change speed or direction...',
    progress: 30
  },
  {
    id: 'm4',
    title: 'Safety Margins',
    description: 'Understanding stopping distances, weather conditions, and safe gaps.',
    icon: 'ArrowRightLeft',
    content: 'Maintaining a safe distance from the vehicle in front is essential. Remember the "two-second rule"...',
    progress: 0
  }
];
