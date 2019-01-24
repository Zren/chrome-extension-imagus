#!/bin/python3

import sys, os
import re
from bs4 import BeautifulSoup

inFilepath = sys.argv[1]
outFilepath = sys.argv[2]

# Read from file
with open(inFilepath, 'r') as fp:
	soup = BeautifulSoup(fp, 'html.parser')

# Prettify
markup = soup.prettify(formatter="minimal")

# Replace 1 space indents with tab
lines = markup.splitlines(keepends=True)
numLines = len(lines)
def reindent(line):
	s = ''
	for i, c in enumerate(line):
		if c == ' ':
			s += '\t'
		else:
			s += line[i:]
			break
	return s
lines = map(reindent, lines)

# Join lines (already has a newline at end of line)
markup = ''.join(lines)

# Write to file
with open(outFilepath, 'w') as fp:
	fp.write(markup)
