import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const API_KEY = process.env.API_KEY;
const BASE_URL = 'https://v6.exchangerate-api.com/v6';

// Тип ответа от API
interface ExchangeRateResponse {
  result: string;
  conversion_rates: Record<string, number>;
  base_code: string;
  time_last_update_utc: string;
}

// Получить курсы для базовой валюты
async function getRates(baseCurrency: string): Promise<ExchangeRateResponse> {
  try {
    const response = await axios.get<ExchangeRateResponse>(
      `${BASE_URL}/${API_KEY}/latest/${baseCurrency}`
    );
    if (response.data.result === 'error') {
      throw new Error('Ошибка API: неверная валюта или ключ');
    }
    return response.data;
  } catch (error) {
    console.error('Ошибка при получении курсов:', error);
    throw error;
  }
}

// Конвертировать сумму из одной валюты в другую
async function convertCurrency(
  amount: number,
  from: string,
  to: string
): Promise<number> {
  const data = await getRates(from);
  const rate = data.conversion_rates[to];
  if (!rate) {
    throw new Error(`Валюта "${to}" не найдена в списке`);
  }
  return amount * rate;
}

// Главная функция (запуск из командной строки)
async function main() {
  const args = process.argv.slice(2);

  if (args.length < 3) {
    console.log('Использование: npm start <сумма> <из_валюты> <в_валюту>');
    console.log('Пример: npm start 100 USD EUR');
    return;
  }

  const amount = parseFloat(args[0]);
  const from = args[1].toUpperCase();
  const to = args[2].toUpperCase();

  if (isNaN(amount) || amount <= 0) {
    console.log('Сумма должна быть положительным числом');
    return;
  }

  try {
    const result = await convertCurrency(amount, from, to);
    console.log(`${amount} ${from} = ${result.toFixed(2)} ${to}`);

    const rates = await getRates(from);
    console.log(`Курс: 1 ${from} = ${rates.conversion_rates[to]} ${to}`);
    console.log(`Обновлено: ${rates.time_last_update_utc}`);
  } catch (error) {
    if (error instanceof Error) {
      console.error(`Ошибка: ${error.message}`);
    } else {
      console.error('Неизвестная ошибка');
    }
  }
}

main();
