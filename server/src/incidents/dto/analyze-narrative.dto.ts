import { IsNotEmpty, IsString } from 'class-validator';

export class AnalyzeNarrativeDto {
  @IsString()
  @IsNotEmpty()
  narrative: string;
}
