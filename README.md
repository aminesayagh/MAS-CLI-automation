# MAS CLI

A powerful CLI automation tool for developers, focused on streamlining development workflows and documentation generation.

## Features

- 📝 **Documentation Generation**: Automatically generate comprehensive documentation for your codebase
- 📂 **File System Operations**: Intuitive file listing and management
- 🎨 **Interactive Interface**: User-friendly CLI with interactive menus
- ⚙️ **Flexible Configuration**: Customizable options for each command

## Installation

```bash
npm install -g mas
```

Requires Node.js version 18 or higher.

## Usage

You can use MAS CLI in two ways:

### 1. Interactive Mode

Simply run:

```bash
mas
```

This will launch an interactive menu where you can select commands and options.

### 2. Command Line Mode

Run specific commands directly:

```bash
mas <command> [options]
```

## Available Commands

### Documentation Generation (`doc`)

Generate documentation for your project:

```bash
mas doc [options]
```

Options:
- `-p, --pattern <pattern>`: File pattern to match (default: "\.ts$")
- `-o, --output <path>`: Output file path (default: "documentation.md")
- `-e, --exclude <patterns...>`: Patterns to exclude (default: ["node_modules", "dist"])
- `-c, --compress`: Compress output by removing empty lines and comments
- `-s, --max-size <size>`: Maximum file size to process (e.g., "1MB")

Example:
```bash
mas doc --pattern "\.ts$" --output "docs/api.md" --exclude node_modules dist --max-size 2MB
```

### List Files (`list`)

List files in the current directory:

```bash
mas list [options]
```

Options:
- `-a, --all`: Show hidden files

### Exit (`exit`)

Exit the CLI:

```bash
mas exit
```

## Project Structure

```
└── mas
    └── src
        ├── cli
        │   └── index.ts
        ├── command
        │   ├── CommandDoc.ts
        │   ├── CommandExit.ts
        │   ├── CommandList.ts
        │   └── MasCLI.ts
        ├── services
        │   ├── serviceDocumentation
        │   └── serviceFileSystem
        └── types
```

## Configuration

The CLI comes with sensible defaults but can be customized for each command. Key configuration options include:

- Documentation generation patterns
- File size limits
- Output formatting
- Directory exclusion patterns

## Development

To set up the development environment:

1. Clone the repository:
```bash
git clone https://github.com/aminesayagh/mas.git
cd mas
```

2. Install dependencies:
```bash
npm install
```

3. Available scripts:
```bash
npm run build        # Build the project
npm run start       # Run the CLI
npm run typecheck   # Run TypeScript type checking
npm run lint        # Run linting
npm run format      # Format code
npm run ci          # Run all checks and build
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the ISC License - see the LICENSE file for details.

## Author

Mohamed Amine SAYAGH - [Website](https://masayagh.com)

## Links

- [Homepage](https://masayagh.com)
- [GitHub Repository](https://github.com/aminesayagh/mas)
- [Issue Tracker](https://github.com/aminesayagh/mas/issues)