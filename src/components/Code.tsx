import { Text } from "ink";
import React from "react";

type TokenType =
  | "keyword"
  | "string"
  | "comment"
  | "literal"
  | "element"
  | "property"
  | "typeName"
  | "param"
  | "plain";

interface Token {
  type: TokenType;
  value: string;
}

// Combined regex pattern for tokenization
// Order: comments, strings, JSX elements, properties, keywords, literals, numbers, type names, params
const TOKEN_REGEX =
  /(\/\/.*$|\/\*[\s\S]*?\*\/)|("[^"]*"|'[^']*'|`[^`]*`)|(<\/?[A-Z][a-zA-Z0-9]*)|(\b[a-z][a-zA-Z]*(?==))|(\b(?:const|let|var|function|return|export|import|if|else|for|while|class|interface|type|extends|implements|new|this|super|async|await|from|default)\b)|(\b(?:true|false|null|undefined)\b)|(\b\d+(?:\.\d+)?\b)|(\b[A-Z][a-zA-Z0-9]*\b)|(\b[a-z][a-zA-Z0-9]*\b)/g;

// Diff line pattern: optional whitespace, line number, optional +/-, rest of line
const DIFF_LINE_REGEX = /^(\s*)(\d+)(\s*)([+-])?(.*)$/;

function tokenize(code: string): Token[] {
  const tokens: Token[] = [];
  let lastIndex = 0;

  for (const match of code.matchAll(TOKEN_REGEX)) {
    // Add plain text before this match
    if (match.index! > lastIndex) {
      tokens.push({
        type: "plain",
        value: code.slice(lastIndex, match.index),
      });
    }

    // Determine token type based on which capture group matched
    let type: TokenType = "plain";
    if (match[1]) type = "comment";
    else if (match[2]) type = "string";
    else if (match[3]) type = "element";
    else if (match[4]) type = "property";
    else if (match[5]) type = "keyword";
    else if (match[6]) type = "literal";
    else if (match[7]) type = "literal"; // numbers
    else if (match[8]) type = "typeName"; // PascalCase identifiers
    else if (match[9]) type = "param"; // camelCase identifiers

    tokens.push({ type, value: match[0] });
    lastIndex = match.index! + match[0].length;
  }

  // Add remaining plain text
  if (lastIndex < code.length) {
    tokens.push({
      type: "plain",
      value: code.slice(lastIndex),
    });
  }

  return tokens;
}

const TOKEN_COLORS: Record<TokenType, string | undefined> = {
  keyword: "magentaBright",
  string: "red",
  comment: undefined, // uses dimColor instead
  literal: "cyan",
  element: "yellow",
  property: "blue",
  typeName: "yellow",
  param: "cyan",
  plain: undefined,
};

function renderTokens(
  tokens: Token[],
  keyPrefix: string
): React.ReactNode[] {
  return tokens.map((token, i) => {
    const key = `${keyPrefix}-${i}`;
    if (token.type === "comment") {
      return (
        <Text key={key} dimColor>
          {token.value}
        </Text>
      );
    }
    const color = TOKEN_COLORS[token.type];
    return (
      <Text key={key} color={color}>
        {token.value}
      </Text>
    );
  });
}

function highlightLine(line: string, lineIndex: number): React.ReactNode {
  const diffMatch = line.match(DIFF_LINE_REGEX);
  const keyPrefix = `L${lineIndex}`;

  if (diffMatch) {
    const [, leadingSpace, lineNum, spaceAfter, diffMarker, rest] = diffMatch;

    if (diffMarker === "+") {
      // Addition line: line number and + in greenBright
      return (
        <>
          <Text>{leadingSpace}</Text>
          <Text color="greenBright">{lineNum}</Text>
          <Text>{spaceAfter}</Text>
          <Text color="greenBright">{diffMarker}</Text>
          {renderTokens(tokenize(rest), keyPrefix)}
        </>
      );
    } else if (diffMarker === "-") {
      // Deletion line: line number and - in red, rest of line in gray
      return (
        <>
          <Text>{leadingSpace}</Text>
          <Text color="redBright">{lineNum}</Text>
          <Text>{spaceAfter}</Text>
          <Text color="redBright">{diffMarker}</Text>
          <Text color="gray">{rest}</Text>
        </>
      );
    } else {
      // Normal line with line number (no diff marker)
      return (
        <>
          <Text>{leadingSpace}</Text>
          <Text>{lineNum}</Text>
          <Text>{spaceAfter}</Text>
          {renderTokens(tokenize(rest), keyPrefix)}
        </>
      );
    }
  }

  // No line number detected, just tokenize the whole line
  return <>{renderTokens(tokenize(line), keyPrefix)}</>;
}

export function Code({ children }: { children: string }) {
  const lines = children.split("\n");

  return (
    <Text>
      {lines.map((line, i) => (
        <React.Fragment key={i}>
          {highlightLine(line, i)}
          {i < lines.length - 1 ? "\n" : ""}
        </React.Fragment>
      ))}
    </Text>
  );
}
