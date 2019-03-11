"""
Script to find a given set of input patterns in a code directory.

"""

import re
import os
from os import walk
import sys
import json
import argparse

def load_rule_json(filepath, rule_type):
    """
    Function reads and returns JSON data from input file.

    :param filepath: Input JSON file path.
    :return: JSON data.
    """
    with open(filepath, 'r') as f:
        rule_data = f.read()

    rules = json.loads(rule_data)
    for r in rules:
        if rule_type in r:
            return r[rule_type]
    return None


def match_patterns(row, text, filename, input_patterns, output, excludeDirs):
    """
    Function finds all patterns in the input line of a particular file.

    :param row: Line no. of the file.
    :param text: Actual text of the line.
    :param filename: Name of the file.
    :param patterns: A list of patterns to be found in the line.
    :param output: List to append all pattern matches found.
    :return: output list with all matches.
    """
    for p in input_patterns:
        toExclude = []
        if "excludeDirs" in p:
            toExclude.extend(p["excludeDirs"])
        if excludeDirs:
            toExclude.extend([excludeDirs] if "," not in excludeDirs else excludeDirs.split(","))
        exclude = False
        for d in toExclude:
            if ("/" in filename and (d.upper() in filename.upper().split("/")) or d.upper() == filename.upper()):
                exclude = True
                break
        if exclude: break
        if p["flags"]["ignoreCase"] == "True":
            regex = re.compile(p["pattern"], re.I)
        else:
            regex = re.compile(p["pattern"])
        failure_type = p["failureType"]
        for m in regex.finditer(text):
            col = m.start()
            output.append({
                "fileName": filename,
                "pattern": regex.pattern,
                "line": str(row + 1),
                "col": str(col + 1),
                "evaluationStatus": failure_type,
                "patternType": p['patternType'],
                "description": p['description'],
                "evaluationMessage": "Pattern " + regex.pattern + " found.",
                "ruleID": p["ruleID"]})

    return output


def find_all_matches(dir_path, input_patterns, output, excludeDirs):
    """
    Function loops through all files in input dir_path to find patterns.

    :param dir_path: The input code directory path.
    :param patterns: A list of patterns to be found.
    :param output: List of found pattern matches
    :return: output List of matches.
    """
    for (dirpath, _, filenames) in walk(dir_path):

        for f in filenames:
            # todo - change to os agnostic way of filename concat
            fullfile = dirpath + "/" + f
            if not os.path.islink(fullfile):                
                for i, text in enumerate(open(fullfile)):
                     match_patterns(i, text, fullfile, input_patterns, output, excludeDirs)
            
    return output


def write_json_output(output_results_file, output):
    """
    Function writes the output list as a JSON file.

    :param output_results_file: Path of the output JSON file.
    :param output: List of pattern matches found.
    :return: Writes output to JSON file.
    """
    with open(output_results_file, 'w') as fp:
        json.dump(output, fp, indent=4)


def main():
    """
    main function to process all script arguments and execute all functions.

    :return: Exceutes all functions.
    """
    parser = argparse.ArgumentParser()
    parser.add_argument("-i", help='Path of the input json file that contains patterns to be found.')
    parser.add_argument("-d", help='Path of code directory where patterns have to be found.')
    parser.add_argument("-o", help='Path of the output json file where results have to be written.')
    parser.add_argument("-k", help='Key of the patterns section in the input rules file.')
    parser.add_argument("-e", help='Comma separated list of directories to be excluded from scan.')

    try:
        input_pattern_file = ""
        dir_path = ""
        output_results_file = ""
        rule_type = ""
        excludeDirs = ""

        args = parser.parse_args()
        if not args.i or not args.d:
            raise Exception("usage: pattern_matcher.py [-h] [-i I] [-d D] [-o O]")

        if not args.i:
            raise Exception("Please provide input json file path that contains patterns to be found.")
        elif not os.path.exists(args.i):
            raise Exception("Path " + args.i + " of input rules json not found.")
        else:
            input_pattern_file = args.i

        if not args.d:
            raise Exception("Please provide code directory path where patterns have to be found.")
        elif not os.path.exists(args.d):
            raise Exception("Path " + args.d + " of code directory not found.")
        else:
            dir_path = args.d

        if not args.o:
            output_results_file = "./pattern-matcher-results.json"
        else:
            output_results_file = args.o

        if not args.k:
            rule_type = "FMNCP"
        else:
            rule_type = args.k

        if args.e:
            excludeDirs = args.e

        output = []

        print "Input Patterns File Path: ", input_pattern_file
        print "Code Directory Path: ", dir_path

        input_patterns = load_rule_json(input_pattern_file, rule_type)

        if not input_patterns:
            output.append({"evaluationStatus": "Pass",
                           "evaluationMessage": "No key found for rule type " + rule_type + " patterns in input rules file."})
            write_json_output(output_results_file, output)
            return

        print "Finding Patterns ......"
        output = find_all_matches(dir_path, input_patterns, output, excludeDirs)

        if not output:
            output.append(
                {"evaluationStatus": "Pass", "evaluationMessage": "No matches found for rule type " + rule_type + "."})

        write_json_output(output_results_file, output)
        print "Done!"
        print "Results Path: ", output_results_file

    except Exception, e:
        print str(e)
        # Todo Add specific exit codes
        sys.exit(1)


if __name__ == '__main__':
    main()
