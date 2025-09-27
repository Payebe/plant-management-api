import { ApiProperty } from '@nestjs/swagger';

// Entité représentant une plante
export class Plant {
  @ApiProperty({
    example: 'uuid',
    description: 'Identifiant unique de la plante',
  })
  id: string;

  @ApiProperty({
    example: 'uuid',
    description: 'Identifiant de l’utilisateur propriétaire',
  })
  userId: string;

  @ApiProperty({ example: 'Mon Cactus', description: 'Nom de la plante' })
  name: string;

  @ApiProperty({ example: 'Cactus', description: 'Espèce de la plante' })
  species: string;

  @ApiProperty({
    example: '2025-09-26',
    description: 'Date d’achat de la plante',
  })
  purchaseDate: Date;

  @ApiProperty({
    example: 'https://supabase.co/storage/v1/object/public/plants/...',
    description: 'URL de l’image',
  })
  imageUrl?: string;

  @ApiProperty({
    example: { amount: 200, frequency: 7 },
    description: 'Besoins en eau (quantité en ml, fréquence en jours)',
  })
  waterNeeds: { amount: number; frequency: number };

  @ApiProperty({
    example: '2025-09-26T01:52:00.000Z',
    description: 'Date de création',
  })
  createdAt: Date;

  @ApiProperty({
    example: '2025-09-26T01:52:00.000Z',
    description: 'Date de mise à jour',
  })
  updatedAt: Date;
}
// Cette entité est utilisée pour représenter une plante dans l’application.
// Elle inclut des décorateurs Swagger pour la documentation automatique de l’API.
// Pour l’utiliser, il suffit de l’importer dans le contrôleur des plantes et de l’utiliser
// comme type de retour dans les méthodes du contrôleur et du service.
