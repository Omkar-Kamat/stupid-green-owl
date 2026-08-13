import { apiClient } from "@/lib/api-client";
import type {
  AnswerRequest,
  AnswerResponse,
  CompleteResponse,
  LeaderboardResponse,
  PathResponse,
  StartLessonResponse,
  UserResponse,
  UserStatsResponse,
} from "@/lib/api/types";

export const meApi = {
  getProfile: () => apiClient.get<UserResponse>("/me"),
  getStats: () => apiClient.get<UserStatsResponse>("/me/stats"),
  refillHearts: () => apiClient.post<UserStatsResponse>("/me/hearts/refill"),
};

export const pathApi = {
  getPath: () => apiClient.get<PathResponse>("/path"),
};

export const lessonApi = {
  start: (lessonId: number) =>
    apiClient.post<StartLessonResponse>(`/lessons/${lessonId}/start`),
  answer: (attemptId: number, body: AnswerRequest) =>
    apiClient.post<AnswerResponse>(`/lesson-attempts/${attemptId}/answers`, body),
  complete: (attemptId: number) =>
    apiClient.post<CompleteResponse>(`/lesson-attempts/${attemptId}/complete`),
};

export const leaderboardApi = {
  getLeaderboard: () => apiClient.get<LeaderboardResponse>("/leaderboard"),
};
