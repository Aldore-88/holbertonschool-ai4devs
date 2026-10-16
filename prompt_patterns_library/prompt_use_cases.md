# Prompt Use Cases

## Code Quality
- **Refactoring**
  - **Goal**: Improve readability and performance
  - **Input**: Source function in [LANGUAGE]
  - **Output**: Optimized code + explanation

- **Style Enforcement**
  - **Goal**: Enforce consistent naming and formatting
  - **Input**: Code block
  - **Output**: Rewritten code with consistent style

- **Code Review**
  - **Goal**: Identify bugs, code smells and security risks before merging
  - **Input**: Diff or source file in [LANGUAGE]
  - **Output**: List of issues ranked by severity + suggested fixes

## Debugging
- **Error Explanation**
  - **Goal**: Understand what an error message or stack trace means
  - **Input**: Error message / stack trace + related code snippet
  - **Output**: Plain-language explanation of the root cause + fix

- **Bug Isolation**
  - **Goal**: Locate the source of unexpected behavior
  - **Input**: Code, expected behavior and actual behavior
  - **Output**: Step-by-step reasoning pinpointing the faulty line(s)

- **Logging Strategy**
  - **Goal**: Add targeted logging to trace a hard-to-reproduce issue
  - **Input**: Function or module + description of the issue
  - **Output**: Code with strategic log statements + what each one reveals

## Documentation
- **Docstring Generation**
  - **Goal**: Document functions and classes clearly
  - **Input**: Function or class in [LANGUAGE]
  - **Output**: Docstrings describing purpose, parameters, return value and exceptions

- **README Creation**
  - **Goal**: Produce a project overview for new users and contributors
  - **Input**: Project structure, main features and setup steps
  - **Output**: Markdown README with installation, usage and examples

- **Code Explanation**
  - **Goal**: Explain unfamiliar or legacy code
  - **Input**: Code block in [LANGUAGE] + target audience level
  - **Output**: Summary followed by a section-by-section explanation

## Testing
- **Unit Test Generation**
  - **Goal**: Create unit tests covering core functionality
  - **Input**: Function in [LANGUAGE] + testing framework
  - **Output**: Test file with normal, edge and error cases

- **Edge Case Discovery**
  - **Goal**: Identify inputs the code may not handle
  - **Input**: Function signature + implementation
  - **Output**: List of edge cases with expected results

- **Test Data / Mock Creation**
  - **Goal**: Generate realistic test data and mocks for dependencies
  - **Input**: Data schema or external dependency (API, database)
  - **Output**: Sample fixtures and mock objects
