
import { Question, StudyResource } from './types';

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
  },
  {
    id: 'q13',
    text: 'What is the minimum depth of tread for car tires?',
    options: ['1.0 mm', '1.6 mm', '2.5 mm'],
    correctAnswer: '1.6 mm',
    category: 'Safety'
  },
  {
    id: 'q14',
    text: 'When should you use your fog lights?',
    options: ['When it is raining', 'When visibility is less than 100 meters', 'Always at night'],
    correctAnswer: 'When visibility is less than 100 meters',
    category: 'Safety'
  },
  {
    id: 'q15',
    text: 'What should you do if your vehicle breaks down on a motorway?',
    options: ['Wait in the car', 'Stay on the hard shoulder', 'Get out and walk to the nearest exit'],
    correctAnswer: 'Stay on the hard shoulder',
    category: 'Motorway'
  },
  {
    id: 'q16',
    text: 'What does a red triangle sign mean?',
    options: ['Mandatory instruction', 'Warning', 'Information'],
    correctAnswer: 'Warning',
    category: 'Road Signs'
  },
  {
    id: 'q17',
    text: 'How should you react to a driver following too closely?',
    options: ['Brake sharply', 'Speed up', 'Increase your gap to the car in front'],
    correctAnswer: 'Increase your gap to the car in front',
    category: 'Safety'
  },
  {
    id: 'q18',
    text: 'When can you cross a double solid white line?',
    options: ['To overtake a cyclist moving at 10mph or less', 'Never', 'When the road is clear'],
    correctAnswer: 'To overtake a cyclist moving at 10mph or less',
    category: 'Rules of the Road'
  },
  {
    id: 'q19',
    text: 'What is the purpose of the catalytic converter?',
    options: ['To reduce fuel consumption', 'To reduce toxic exhaust emissions', 'To improve engine cooling'],
    correctAnswer: 'To reduce toxic exhaust emissions',
    category: 'Safety'
  },
  {
    id: 'q20',
    text: 'What does a blue circular sign mean?',
    options: ['Warning', 'Positive instruction/Mandatory', 'Prohibition'],
    correctAnswer: 'Positive instruction/Mandatory',
    category: 'Road Signs'
  },
  {
    id: 'q21',
    text: 'In which weather condition are you most likely to experience aquaplaning?',
    options: ['Fog', 'Heavy rain', 'Icy roads'],
    correctAnswer: 'Heavy rain',
    category: 'Safety'
  },
  {
    id: 'q22',
    text: 'What is the standard "thinking distance" at 30mph?',
    options: ['9 meters', '12 meters', '15 meters'],
    correctAnswer: '9 meters',
    category: 'Safety'
  },
  {
    id: 'q23',
    text: 'What should you do if you miss your exit on a motorway?',
    options: ['Reverse back', 'Carry on to the next exit', 'Do a U-turn across the central reservation'],
    correctAnswer: 'Carry on to the next exit',
    category: 'Motorway'
  },
  {
    id: 'q24',
    text: 'What is the main cause of skidding?',
    options: ['The driver', 'The road surface', 'The vehicle brakes'],
    correctAnswer: 'The driver',
    category: 'Safety'
  },
  {
    id: 'q25',
    text: 'What does a flashing amber light at a pelican crossing mean?',
    options: ['Stop and wait for the green light', 'Give way to pedestrians on the crossing', 'Proceed with caution'],
    correctAnswer: 'Give way to pedestrians on the crossing',
    category: 'Rules of the Road'
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
