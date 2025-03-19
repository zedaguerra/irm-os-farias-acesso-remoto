import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(8, 'Senha deve ter no mínimo 8 caracteres')
});

export const profileSchema = z.object({
  fullName: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
  phone: z.string().optional(),
  companyName: z.string().optional(),
  isServiceProvider: z.boolean(),
  serviceType: z.enum(['technical', 'maintenance', 'consulting']).optional()
});

export const deviceSchema = z.object({
  name: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres'),
  type: z.enum(['desktop', 'mobile']),
  os: z.string().min(1, 'Sistema operacional é obrigatório')
});

export const metricSchema = z.object({
  cpuUsage: z.number().min(0).max(100),
  memoryUsage: z.number().min(0).max(100),
  diskUsage: z.number().min(0).max(100)
});

export type LoginInput = z.infer<typeof loginSchema>;
export type ProfileInput = z.infer<typeof profileSchema>;
export type DeviceInput = z.infer<typeof deviceSchema>;
export type MetricInput = z.infer<typeof metricSchema>;