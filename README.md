# 📌 F1 Data API

🚀 **F1 Data API** provides access to historical Formula 1 data. Ideal for developers, analysts, and enthusiasts who want to integrate race statistics, driver and team information, and more into their projects.

## ✨ Features
- 📊 Race, driver, team, and circuit data.
- ⏱️ Historical statistics.
- 🔧 Easy-to-use RESTful endpoints.
- 📂 Supports multiple output formats (JSON, XML, etc.).

## 🚀 Installation
```bash
git clone https://github.com/pperezdem/f1-data-api.git
cd f1-data-api
npm install
```

## 🏁 Usage
Check out the full documentation on the [Wiki](#) or test the endpoints with:
```bash
curl -X GET "https://api.f1data.com/races/2024" -H "Authorization: Bearer YOUR_API_KEY"
```

## Design
You can find the API design at this link [Design Doc](Design/openapi-f1data.yaml).

![](img/methods.png)

## 👩‍💻 Developers
This project was developed by:
- [Carlos Moragón](https://github.com/carlosMoragon)
- [Orianna Milone](https://github.com/OriannaMilone)
- [Paloma Pérez de Madrid](https://github.com/PPerezdeMadrid)

## 📜 License
This project is licensed under the MIT License.

🔗 **Contributions welcome**. Fork the project and improve the API! 🚀



## Usage Instructions

### Step 1: Convert CSV files to JSON

Run the Python script to generate JSON files:

```bash
python DataJSON.py
```

### Step 2: Import JSON files into MongoDB

Make the import script executable and run it:

```bash
chmod +x importData.sh
./importData.sh
```
