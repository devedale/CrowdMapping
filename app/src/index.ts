// src/index.ts
import app from './app';
const PORT: number = parseInt(process.env.API_PORT || '3000');
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});


