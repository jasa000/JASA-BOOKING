export type User = {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  role: 'user' | 'admin';
};

export type Event = {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  organizer: string;
  imageUrl: string;
  imageHint: string;
  status: 'pending' | 'approved' | 'rejected';
  category: string;
};
