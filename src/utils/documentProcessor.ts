// Utility for processing legal documents and extracting data
export interface ProcessData {
  number: string;
  parties: {
    plaintiff: string;
    defendant: string;
  };
  court: string;
  value: string;
  subject: string;
  date: string;
  status: string;
}

export const extractDataFromFile = async (file: File): Promise<ProcessData> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const content = e.target?.result as string;
      
      // Simulate AI-powered data extraction
      setTimeout(() => {
        const mockData: ProcessData = {
          number: "0001234-56.2024.8.26.0100",
          parties: {
            plaintiff: "BANCO DO BRASIL S.A.",
            defendant: "JOÃO DA SILVA SANTOS"
          },
          court: "1ª Vara Cível de São Paulo",
          value: "R$ 50.000,00",
          subject: "Cobrança de Dívida",
          date: new Date().toLocaleDateString('pt-BR'),
          status: "Em andamento"
        };
        
        resolve(mockData);
      }, 2000);
    };
    
    if (file.type === 'application/pdf') {
      reader.readAsArrayBuffer(file);
    } else {
      reader.readAsText(file);
    }
  });
};

export const generateDocument = (template: string, data: ProcessData, additionalData: any) => {
  const templates = {
    'manifestacao-endereco': `EXCELENTÍSSIMO(A) SENHOR(A) DOUTOR(A) JUIZ(A) DE DIREITO DA ${data.court}

AUTOS: ${data.number}
REQUERENTE: ${data.parties.plaintiff}
REQUERIDO: ${data.parties.defendant}

${data.parties.plaintiff}, já qualificado nos autos em epígrafe, vem respeitosamente à presença de Vossa Excelência, por meio de seu procurador devidamente constituído, apresentar:

MANIFESTAÇÃO SOBRE NOVO ENDEREÇO

Informa que o endereço atual é: ${additionalData.newAddress}

${additionalData.observations || 'Sem observações adicionais.'}

Termos em que,
Pede deferimento.

Local, data.
Advogado
OAB/XX XXXXX`,

    'dilacao-prazo': `EXCELENTÍSSIMO(A) SENHOR(A) DOUTOR(A) JUIZ(A) DE DIREITO DA ${data.court}

AUTOS: ${data.number}  
REQUERENTE: ${data.parties.plaintiff}
REQUERIDO: ${data.parties.defendant}

${data.parties.plaintiff}, vem respeitosamente requerer:

DILAÇÃO DE PRAZO

Requer a dilação do prazo por ${additionalData.days} dias, pelos motivos: ${additionalData.reason}

${additionalData.observations || ''}

Termos em que,
Pede deferimento.

Local, data.
Advogado
OAB/XX XXXXX`,

    'pesquisa-endereco': `EXCELENTÍSSIMO(A) SENHOR(A) DOUTOR(A) JUIZ(A) DE DIREITO DA ${data.court}

AUTOS: ${data.number}
REQUERENTE: ${data.parties.plaintiff}  
REQUERIDO: ${data.parties.defendant}

${data.parties.plaintiff}, vem requerer:

PESQUISA DE ENDEREÇO

Requer pesquisa de endereço da parte ${additionalData.targetParty} junto aos órgãos: ${additionalData.searchOrgans}

Justificativa: ${additionalData.justification}

Termos em que,
Pede deferimento.

Local, data.
Advogado
OAB/XX XXXXX`
  };

  return templates[template as keyof typeof templates] || 'Modelo não encontrado';
};