export interface Milestone {
  id: string;
  date: string;
  title: string;
  description: string;
  icon: 'salary' | 'shopping';
}

export const siteConfig = {
  journey: {
    startLocation: "Thrissur",
    endLocation: "Gurugram",
    trainBoardingDate: "2026-08-04T12:00:00",
    arrivalDate: "2026-08-06T12:00:00",
  },
  milestones: [
    {
      id: "m1",
      date: "2026-06-15",
      title: "First Salary! 💸",
      description: "So incredibly proud of you for securing the bag.",
      icon: "salary",
    },
    {
      id: "m2",
      date: "2026-07-01",
      title: "The H&M Haul 🛍️",
      description: "Bought completely with your own hard-earned money. Independent and stylish!",
      icon: "shopping",
    },
  ] as Milestone[],
};
