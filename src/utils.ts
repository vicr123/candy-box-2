export function sanitiseText(text: string) {
    return [...text].map(character => {
        if (`ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890!@#$%^&*()-_=+[{]}"'|\\,./?\`~ :;`.includes(character)) {
            return character;
        }
        return `?`;
    }).join("");
}

export function san(strings: TemplateStringsArray, ...args: (string | number)[]) {
    return strings.reduce((acc, str, i) => acc + str + (sanitiseText(args[i]?.toString() ?? "")), "");
}