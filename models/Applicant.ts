// models/Applicant.ts

interface Applicant {
  _id?: string;
  name: string;
  email: string;
  major: string;
  year: string;
  profilePhotoUrl: string;
  resumeUrl: string;
  portfolioUrl: string;
  notes: {
    userId: string;
    content: string;
    timestamp: Date;
  }[];
  ratings: {
    userId: string;
    value: "up" | "neutral" | "down";
  }[];
}

export default Applicant;
