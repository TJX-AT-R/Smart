import { Question, LessonModule } from './types';

export const MOCK_QUESTIONS: Question[] = [
  {
    id: 'q1',
    text: 'What should you do when you see a "Stop" sign at a junction?',
    options: ['Slow down and proceed if clear', 'Come to a complete stop behind the line', 'Flash your lights and continue'],
    correctAnswer: 'Come to a complete stop behind the line',
    category: 'Road Signs'
  },
  {
    id: 'q2',
    text: 'What is the national speed limit for a car on a single carriageway road?',
    options: ['50 mph', '60 mph', '70 mph'],
    correctAnswer: '60 mph',
    category: 'Rules of the Road'
  },
  {
    id: 'q3',
    text: 'You are driving behind a large vehicle. Why should you keep well back?',
    options: ['To allow others to overtake you', 'To allow the driver to see you in their mirrors', 'To see the traffic lights more clearly'],
    correctAnswer: 'To allow the driver to see you in their mirrors',
    category: 'Safety'
  },
  {
    id: 'q4',
    text: 'What does a circular road sign with a red border and a number inside mean?',
    options: ['Maximum speed limit', 'Recommended speed', 'Minimum speed limit'],
    correctAnswer: 'Maximum speed limit',
    category: 'Road Signs'
  },
  {
    id: 'q5',
    text: 'When may you use the right-hand lane on a three-lane motorway?',
    options: ['When you are driving faster than 70 mph', 'When you are overtaking', 'When the other lanes are busy'],
    correctAnswer: 'When you are overtaking',
    category: 'Motorway'
  },
  {
    id: 'q6',
    text: 'What color are the reflective studs between a motorway and its slip road?',
    options: ['Amber', 'White', 'Green'],
    correctAnswer: 'Green',
    category: 'Motorway'
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
    category: 'Rules of the Road'
  },
  {
    id: 'q9',
    text: 'When must you use your headlights?',
    options: ['When driving in tunnels', 'When visibility is seriously reduced', 'Always between sunset and sunrise'],
    correctAnswer: 'When visibility is seriously reduced',
    category: 'Safety'
  },
  {
    id: 'q10',
    text: 'What does a broken white line along the center of the road mean?',
    options: ['Hazard ahead', 'No overtaking', 'Permissive lane divider'],
    correctAnswer: 'Permissive lane divider',
    category: 'Road Signs'
  },
  {
    id: 'q11',
    text: 'You are waiting to emerge from a junction. Your view is restricted by parked vehicles. What should you do?',
    options: ['Stop and then move forward slowly', 'Wait until someone signals you to go', 'Move out quickly before any traffic arrives'],
    correctAnswer: 'Stop and then move forward slowly',
    category: 'Rules of the Road'
  },
  {
    id: 'q12',
    text: 'What color follows the green signal at a puffin crossing?',
    options: ['Steady amber', 'Flashing amber', 'Steady red'],
    correctAnswer: 'Steady amber',
    category: 'Road Signs'
  },
  {
    id: 'q13',
    text: 'How should you drive when you are towing a trailer?',
    options: ['Faster than usual to keep up', 'Slower and with extra care', 'In the right-hand lane of a motorway'],
    correctAnswer: 'Slower and with extra care',
    category: 'Safety'
  },
  {
    id: 'q14',
    text: 'What is the shortest stopping distance at 70 mph?',
    options: ['75 meters', '96 meters', '110 meters'],
    correctAnswer: '96 meters',
    category: 'Safety'
  },
  {
    id: 'q15',
    text: 'Why should you use your mirrors when you see a hazard ahead?',
    options: ['To see how the hazard will affect others', 'To check what is happening behind you', 'To alert other drivers behind you'],
    correctAnswer: 'To check what is happening behind you',
    category: 'Safety'
  },
  {
    id: 'q16',
    text: 'You are following a cyclist. They signal to turn right. What should you do?',
    options: ['Overtake them on the left', 'Wait behind them', 'Sound your horn to warn them'],
    correctAnswer: 'Wait behind them',
    category: 'Hazard Perception'
  },
  {
    id: 'q17',
    text: 'What should you do when driving in heavy rain?',
    options: ['Turn on your hazard lights', 'Increase your distance from the vehicle in front', 'Drive at the speed limit'],
    correctAnswer: 'Increase your distance from the vehicle in front',
    category: 'Safety'
  },
  {
    id: 'q18',
    text: 'What does it mean if a pedestrian is carrying a white stick with a red band?',
    options: ['They are deaf', 'They are blind and deaf', 'They are physically disabled'],
    correctAnswer: 'They are blind and deaf',
    category: 'Safety'
  },
  {
    id: 'q19',
    text: 'When should you check the oil level in your engine?',
    options: ['Every time you fill up with fuel', 'Before a long journey', 'Only when the oil light comes on'],
    correctAnswer: 'Before a long journey',
    category: 'Safety'
  },
  {
    id: 'q20',
    text: 'What should you do if your anti-lock brakes (ABS) warning light stays on?',
    options: ['Check the footbrake for a firm feel', 'Have the system checked immediately', 'Avoid heavy braking'],
    correctAnswer: 'Have the system checked immediately',
    category: 'Safety'
  },
  {
    id: 'q21',
    text: 'What does a red triangle road sign mean?',
    options: ['A warning', 'A command', 'Information'],
    correctAnswer: 'A warning',
    category: 'Road Signs'
  },
  {
    id: 'q22',
    text: 'You see a pedestrian waiting to cross at a zebra crossing. What should you do?',
    options: ['Stop and wait for them to cross', 'Wave them across', 'Continue if they are still on the pavement'],
    correctAnswer: 'Stop and wait for them to cross',
    category: 'Rules of the Road'
  },
  {
    id: 'q23',
    text: 'What is the national speed limit on a dual carriageway for cars?',
    options: ['50 mph', '60 mph', '70 mph'],
    correctAnswer: '70 mph',
    category: 'Rules of the Road'
  },
  {
    id: 'q24',
    text: 'When may you use hazard warning lights while driving?',
    options: ['When you are double-parked', 'When you break down on a motorway', 'To thank another driver'],
    correctAnswer: 'When you break down on a motorway',
    category: 'Safety'
  },
  {
    id: 'q25',
    text: 'What should you do when approaching a bridge that is only wide enough for one vehicle?',
    options: ['Wait for any oncoming traffic', 'Sound your horn and proceed', 'Flash your lights and proceed'],
    correctAnswer: 'Wait for any oncoming traffic',
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
