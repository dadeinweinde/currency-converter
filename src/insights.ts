import * as fs from 'fs';
import * as readline from 'readline';
// Если не хочешь использовать chalk — удали эту строку и все chalk. в коде
import chalk from 'chalk';

type Insight = string;

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Загружаем сохранённые инсайты из файла (если есть)
let insights: Insight[] = [];
try {
    const data = fs.readFileSync('insights.json', 'utf8');
    insights = JSON.parse(data);
} catch {
    // Если файла нет — создаём начальный список
    insights = [
        "Сегодня я был терпеливее обычного.",
        "Мозг может видеть одну задачу тремя способами.",
        "После прогулки мысли становятся яснее.",
        "Код — это не только логика, но и искусство.",
        "Микродоза не делает меня супергероем, но помогает видеть детали."
    ];
    fs.writeFileSync('insights.json', JSON.stringify(insights, null, 2));
}

function saveInsights() {
    fs.writeFileSync('insights.json', JSON.stringify(insights, null, 2));
}

function addInsight(text: string) {
    insights.push(text);
    saveInsights();
    console.log(chalk.green(`✅ Добавлено: "${text}"`));
}

function getRandomInsight(): Insight {
    const randomIndex = Math.floor(Math.random() * insights.length);
    return insights[randomIndex];
}

// --- Основная логика ---

console.log(chalk.cyan('🌿 Твой инсайт дня:'));
console.log(chalk.yellow(getRandomInsight()));

// Вставляем сюда
const intervalId = setInterval(() => {
    // Если не хочешь, чтобы стирался твой текст ввода, убери console.clear()
    // или используй console.log('\n') для отступа
    console.clear(); 
    console.log(chalk.cyan('🌿 Новый инсайт:'));
    console.log(chalk.yellow(getRandomInsight()));
}, 10000);

// ЕДИНСТВЕННЫЙ вызов rl.question (без дублей ниже!)
rl.question('Введи новую мысль (или нажми Enter для выхода): ', (answer) => {
    // 2. Обязательно останавливаем таймер
    clearInterval(intervalId);

    if (answer.trim()) {
        addInsight(answer.trim());
        console.log(chalk.blue('Обновленный список:'));
        console.log(insights.map((i, idx) => `${idx+1}. ${i}`).join('\n'));
    } else {
        console.log(chalk.gray('Пока!'));
    }
    rl.close();
});

