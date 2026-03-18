
import { Question, LessonModule, StudyResource } from './types';

export const MOCK_QUESTIONS: Question[] = [
  {
    id: 'q1',
    text: 'What should you do when you see a "Stop" sign at a junction?',
    options: ['Slow down and proceed if clear', 'Come to a complete stop behind the line', 'Flash your lights and continue'],
    correctAnswer: 'Come to a complete stop behind the line',
    category: 'Road Signs',
    imageUrl: 'https://picsum.photos/seed/signs1/600/400'
  },
  {
    id: 'q2',
    text: 'What is the national speed limit for a car on a single carriageway road?',
    options: ['50 mph', '60 mph', '70 mph'],
    correctAnswer: '60 mph',
    category: 'Rules of the Road',
    imageUrl: 'https://picsum.photos/seed/road1/600/400'
  },
  {
    id: 'q3',
    text: 'You are driving behind a large vehicle. Why should you keep well back?',
    options: ['To allow others to overtake you', 'To allow the driver to see you in their mirrors', 'To see the traffic lights more clearly'],
    correctAnswer: 'To allow the driver to see you in their mirrors',
    category: 'Safety',
    imageUrl: 'https://picsum.photos/seed/truck1/600/400'
  },
  {
    id: 'q4',
    text: 'What does a circular road sign with a red border and a number inside mean?',
    options: ['Maximum speed limit', 'Recommended speed', 'Minimum speed limit'],
    correctAnswer: 'Maximum speed limit',
    category: 'Road Signs',
    imageUrl: 'https://picsum.photos/seed/signs2/600/400'
  },
  {
    id: 'q5',
    text: 'When may you use the right-hand lane on a three-lane motorway?',
    options: ['When you are driving faster than 70 mph', 'When you are overtaking', 'When the other lanes are busy'],
    correctAnswer: 'When you are overtaking',
    category: 'Motorway',
    imageUrl: 'https://picsum.photos/seed/motorway1/600/400'
  },
  {
    id: 'q6',
    text: 'What color are the reflective studs between a motorway and its slip road?',
    options: ['Amber', 'White', 'Green'],
    correctAnswer: 'Green',
    category: 'Motorway',
    imageUrl: 'https://picsum.photos/seed/motorway2/600/400'
  },
  {
    id: 'q7',
    text: 'A driver does something that upsets you. What should you do?',
    options: ['Flash your headlights', 'Try not to react', 'Sound your horn'],
    correctAnswer: 'Try not to react',
    category: 'Safety'
  },
  {
    id: 'q8',
    text: 'What should you do before making a U-turn?',
    options: ['Check all around for other road users', 'Signal so that other drivers can see you', 'Look over your shoulder for final confirmation'],
    correctAnswer: 'Check all around for other road users',
    category: 'Rules of the Road',
    imageUrl: 'https://picsum.photos/seed/car1/600/400'
  },
  {
    id: 'q9',
    text: 'When must you use your headlights?',
    options: ['When driving in tunnels', 'When visibility is seriously reduced', 'Always between sunset and sunrise'],
    correctAnswer: 'When visibility is seriously reduced',
    category: 'Safety',
    imageUrl: 'https://picsum.photos/seed/night1/600/400'
  },
  {
    id: 'q10',
    text: 'What does a broken white line along the center of the road mean?',
    options: ['Hazard ahead', 'No overtaking', 'Permissive lane divider'],
    correctAnswer: 'Permissive lane divider',
    category: 'Road Signs',
    imageUrl: 'https://picsum.photos/seed/road2/600/400'
  },
  {
    id: 'q11',
    text: 'What does this road sign mean?',
    options: ['End of dual carriageway', 'Two-way traffic straight ahead', 'End of two-way traffic'],
    correctAnswer: 'Two-way traffic straight ahead',
    category: 'Road Signs',
    imageUrl: 'https://picsum.photos/seed/signs3/600/400'
  },
  {
    id: 'q12',
    text: 'Which arm signal tells you a driver intends to pull up?',
    options: ['Arm moving up and down', 'Arm pointing left', 'Arm moving in a circle'],
    correctAnswer: 'Arm moving up and down',
    category: 'Rules of the Road'
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

export const MOCK_RESOURCES: StudyResource[] = [
  {
    id: 'res1',
    title: 'The Highway Code 2024 Edition',
    description: 'The complete official guide to road safety and UK traffic laws in PDF format.',
    priceDollars: 5,
    downloadUrl: '#',
    thumbnailUrl: 'https://picsum.photos/seed/res1/400/600'
  },
  {
    id: 'res2',
    title: 'Road Signs Masterclass',
    description: 'A visual encyclopedia of every UK road sign with detailed explanations of their meanings.',
    priceDollars: 5,
    downloadUrl: '#',
    thumbnailUrl: 'https://picsum.photos/seed/res2/400/600'
  },
  {
    id: 'res3',
    title: 'Hazard Perception Workbook',
    description: 'A comprehensive guide to identifying hazards early, including 50 real-world scenarios.',
    priceDollars: 5,
    downloadUrl: '#',
    thumbnailUrl: 'https://picsum.photos/seed/res3/400/600'
  },
  {
    id: 'res4',
    title: 'Mock Test Ultimate Bank',
    description: '1000+ practice questions compiled from previous years to guarantee your pass.',
    priceDollars: 5,
    downloadUrl: '#',
    thumbnailUrl: 'https://picsum.photos/seed/res4/400/600'
  }
];
