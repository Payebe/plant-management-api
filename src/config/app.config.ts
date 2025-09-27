export const appConfig = () => ({
  port: parseInt(process.env.PORT ?? '3000', 10), // Utiliser ?? pour fournir une valeur par défaut
  nodeEnv: process.env.NODE_ENV ?? 'development', // Valeur par défaut pour NODE_ENV
});
// Ce fichier gère la configuration de l'application en chargeant les variables d'environnement
// définies dans le fichier .env. Il fournit des valeurs par défaut pour certaines variables
// afin d'assurer que l'application fonctionne correctement même si certaines variables
// ne sont pas définies. Pour l'utiliser, il suffit de l'ajouter au tableau `load`
// dans la configuration du ConfigModule dans app.module.ts.
