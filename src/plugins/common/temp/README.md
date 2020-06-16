# HENTA Плагин: common/temp
[![Codacy Badge](https://api.codacy.com/project/badge/Grade/683c16cdaa21483d9cd29f12f5e0ec55)](https://www.codacy.com/gh/StandartHentaPlugins/temp?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=StandartHentaPlugins/temp&amp;utm_campaign=Badge_Grade)

С помощью этого плагина можно легко манипулировать временными файлами.

```js
const tempPlugin = henta.getPlugin('common/temp');
```

## Установка
Используйте консоль HENTA
```
p-install StandartHentaPlugins/temp
```

## API
### Получение пути для файла
```js
tempPlugin.get(extension); // => tempPath
```

| Параметр  | Тип    | Описание             |
|-----------|--------|----------------------|
| extension | string | Расширение файла     |

### Освобождение пути
```js
tempPath.free();
```

## Пример
```js
  const tempPlugin = henta.getPlugin('common/temp');
  const myPath = tempPlugin.get('txt');

  fs.writeFileSync(myPath, 'somebody once told me...');
  // Делаем что-нибудь с этим файлом.

  myPath.free();
```