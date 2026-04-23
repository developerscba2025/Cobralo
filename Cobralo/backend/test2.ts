import router from './src/routes/auth';
console.log(router.stack.map((layer: any) => layer.route ? layer.route.path : layer.name));
