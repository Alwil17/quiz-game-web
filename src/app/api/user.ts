// // methods for creating, updating, deleting, and getting users from api endpoints
// import { NextApiRequest, NextApiResponse } from "next";
// import { api } from "./api";
// import { User } from "@/types/user";

// export default async function handler(
//     req: NextApiRequest,
//     res: NextApiResponse<User[] | { error: string }>
//   ) {
//     try {
//       const response = await fetch('https://sapientia-quiz-game-api.vercel.app/api/users');
//       if (!response.ok) {
//         throw new Error(`API responded with status: ${response.status}`);
//       }
//       const data = await response.json();
//       res.status(200).json(data);
//     } catch (error) {
//       console.error('Error fetching users:', error);
//       res.status(500).json({ error: 'Failed to fetch users' });
//     }
//   }