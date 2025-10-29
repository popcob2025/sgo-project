import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Protocol } from './entities/protocol.entity';
import { IncidentNature } from '../incidents/entities/incident-nature.entity';
import { Repository } from 'typeorm';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { PDFParse } from 'pdf-parse';

@Injectable()
export class ProtocolsService {
  private genAI: GoogleGenerativeAI;

  constructor(
    @InjectRepository(Protocol)
    private protocolRepository: Repository<Protocol>,
    @InjectRepository(IncidentNature)
    private incidentNatureRepository: Repository<IncidentNature>,
  ) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error(
        'GEMINI_API_KEY is not set in the environment variables.',
      );
    }
    this.genAI = new GoogleGenerativeAI(apiKey);
  }

  /**
   * Processa o upload de um PDF, extrai texto, analisa com IA e salva no DB.
   */
  async processPdfProtocol(
    file: Express.Multer.File,
    natureId: string,
  ): Promise<Protocol> {
    // 1. Verificar se a Natureza do Incidente existe
    const incidentNature = await this.incidentNatureRepository.findOne({
      where: { id: natureId },
    });

    if (!incidentNature) {
      throw new NotFoundException(
        `IncidentNature com ID ${natureId} não encontrada.`,
      );
    }

    // 2. Ler o texto do PDF
    const parser = new PDFParse({ data: file.buffer });
    try {
      const data = await parser.getText();
      const pdfText = data.text;

      // 3. Analisar o texto com a IA
      const structuredData = await this.analyzeTextWithGemini(pdfText);

      // 4. Salvar ou Atualizar o Protocolo no DB
      // Verifica se já existe um protocolo para esta natureza
      let protocol = await this.protocolRepository.findOne({
        where: { incidentNature: { id: natureId } },
      });

      if (!protocol) {
        protocol = this.protocolRepository.create(); // Cria um novo se não existir
        protocol.incidentNature = incidentNature;
      }

      // Atualiza o protocolo com os dados da IA
      protocol.questions = structuredData.questions;
      protocol.instructions = structuredData.instructions;
      protocol.keywords = structuredData.keywords;
      protocol.originalPdfPath = file.originalname; // Guarda o nome do arquivo

      return this.protocolRepository.save(protocol);
    } catch (error) {
      console.error('Error processing PDF:', error);
      throw new InternalServerErrorException('Failed to process PDF file.');
    } finally {
      await parser.destroy();
    }
  }

  /**
   * Método privado para chamar a API do Gemini e estruturar o texto.
   */
  private async analyzeTextWithGemini(text: string): Promise<{
    questions: string[];
    instructions: string;
    keywords: string[];
  }> {
    try {
      const model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });

      const prompt = `
        Você é um assistente especializado em padronização de protocolos de emergência (Bombeiros, SAMU).
        Analise o texto do protocolo de emergência a seguir e extraia as informações requisitadas.
        Seu retorno DEVE ser APENAS um objeto JSON, sem nenhum outro texto ou formatação (como 'json'). 

        O JSON deve ter a seguinte estrutura:
        {
          "questions": ["..."],
          "instructions": "...",
          "keywords": ["..."]
        }

        - "questions": Um array de strings com as perguntas-chave que o operador deve fazer (ex: "A vítima está consciente?").
        - "instructions": Um texto único com as instruções pré-socorro que o operador deve dar (ex: "Não movimente a vítima.").
        - "keywords": Um array de strings com palavras-chave que identificam esta ocorrência (ex: "atropelamento", "preso nas ferragens", "inconsciente").

        TEXTO DO PROTOCOLO PARA ANÁLISE:
        ---
        ${text}
        ---
        JSON DE RETORNO:
      `;

      const result = await model.generateContent(prompt);
      const response = result.response;
      const jsonResponse = response.text();

      // Limpa a resposta para garantir que é um JSON válido
      const cleanedJson = jsonResponse
        .replace(/'''json/g, '')
        .replace(/'''/g, '')
        .trim();

      return JSON.parse(cleanedJson) as {
        questions: string[];
        instructions: string;
        keywords: string[];
      };
    } catch (error) {
      console.error('Erro na API do Gemini:', error);
      throw new InternalServerErrorException(
        'Falha ao analisar o texto do protocolo com a IA.',
      );
    }
  }
}
