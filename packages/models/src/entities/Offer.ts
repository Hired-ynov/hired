import { Skill } from './Skill';

export interface Offer {
  id: string;
  title: string;
  description: string;
  location: string;
  salaryRange: {
    min: number;
    max: number;
  };
  companyId: string;
  skills: Skill[];
  createdAt: Date;
  updatedAt: Date;
  filesIds: string[];
}
