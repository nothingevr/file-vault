/**
 * Python IntelliSense & Autocomplete Provider for Monaco Editor
 * Provides comprehensive completion items for:
 * - Standard library modules & popular 3rd party packages
 * - Dot-completion on modules (os., sys., math., json., random., re., datetime., np., pd., plt., requests., etc.)
 * - 70+ Python built-in functions with parameter signatures and docstrings
 * - Idiomatic Python snippets (def, class, try/except, list/dict comps, with open, if __name__ == '__main__')
 * - Dynamic workspace symbols: functions, classes, and variables parsed live across all open files
 * - Hover documentation provider
 */

(function (window) {
    'use strict';

    // ---- 1. PYTHON MODULES LIST ----
    const PYTHON_MODULES = [
        { name: 'os', desc: 'Miscellaneous operating system interfaces (files, directories, environment, processes).' },
        { name: 'sys', desc: 'System-specific parameters and functions (argv, stdin/stdout, exit, version).' },
        { name: 'math', desc: 'Mathematical functions (sqrt, pow, sin, cos, ceil, floor, pi, e).' },
        { name: 'json', desc: 'JSON encoder and decoder (loads, dumps, load, dump).' },
        { name: 'random', desc: 'Generate pseudo-random numbers, choice, sample, shuffle, uniform.' },
        { name: 're', desc: 'Regular expression matching operations (search, match, findall, sub, compile).' },
        { name: 'datetime', desc: 'Basic date and time types (datetime, date, time, timedelta, timezone).' },
        { name: 'collections', desc: 'High-performance container datatypes (Counter, defaultdict, deque, namedtuple).' },
        { name: 'itertools', desc: 'Functions creating iterators for efficient looping (chain, product, combinations).' },
        { name: 'functools', desc: 'Higher-order functions and operations on callable objects (lru_cache, partial, reduce).' },
        { name: 'typing', desc: 'Support for type hints (List, Dict, Tuple, Optional, Union, Any, Callable).' },
        { name: 'pathlib', desc: 'Object-oriented filesystem paths (Path).' },
        { name: 'csv', desc: 'CSV file reading and writing (reader, writer, DictReader, DictWriter).' },
        { name: 'sqlite3', desc: 'DB-API 2.0 interface for SQLite databases.' },
        { name: 'asyncio', desc: 'Asynchronous I/O, event loop, coroutines and tasks.' },
        { name: 'subprocess', desc: 'Subprocess management, spawning new processes and capturing output.' },
        { name: 'time', desc: 'Time access and conversions (time, sleep, perf_counter, strftime).' },
        { name: 'shutil', desc: 'High-level file operations (copy, copy2, move, rmtree, make_archive).' },
        { name: 'pickle', desc: 'Python object serialization and deserialization.' },
        { name: 'logging', desc: 'Logging facility for Python (getLogger, basicConfig, info, warning, error).' },
        { name: 'unittest', desc: 'Unit testing framework (TestCase, mock).' },
        { name: 'hashlib', desc: 'Secure hash and message digest algorithms (sha256, md5, sha1).' },
        { name: 'urllib', desc: 'URL handling modules (request, parse, error).' },
        { name: 'socket', desc: 'Low-level networking interface.' },
        { name: 'threading', desc: 'Thread-based parallelism (Thread, Lock, Event, Semaphore).' },
        { name: 'multiprocessing', desc: 'Process-based parallelism (Process, Pool, Queue).' },
        { name: 'dataclasses', desc: 'Data classes decorator and functions (@dataclass, field).' },
        { name: 'uuid', desc: 'UUID objects according to RFC 4122 (uuid4, uuid1).' },
        { name: 'copy', desc: 'Shallow and deep copy operations (copy, deepcopy).' },
        { name: 'io', desc: 'Core tools for working with streams (StringIO, BytesIO).' },
        { name: 'glob', desc: 'Unix style pathname pattern expansion (glob, iglob).' },
        { name: 'tempfile', desc: 'Generate temporary files and directories (NamedTemporaryFile, TemporaryDirectory).' },
        { name: 'argparse', desc: 'Parser for command-line options, arguments and sub-commands.' },
        { name: 'inspect', desc: 'Inspect live objects, signature, docstring, call stack.' },
        { name: 'traceback', desc: 'Print or retrieve a stack traceback (format_exc, print_exc).' },
        { name: 'contextlib', desc: 'Utilities for with-statement contexts (contextmanager, suppress).' },
        { name: 'heapq', desc: 'Heap queue algorithm (priority queue) (heappush, heappop, heapify).' },
        { name: 'bisect', desc: 'Array bisection algorithm for sorted sequences (bisect, insort).' },
        { name: 'statistics', desc: 'Mathematical statistics functions (mean, median, mode, stdev).' },
        { name: 'enum', desc: 'Support for enumerations (Enum, IntEnum, auto).' },
        { name: 'queue', desc: 'A synchronized queue class (Queue, LifoQueue, PriorityQueue).' },
        { name: 'zipfile', desc: 'Work with ZIP archives (ZipFile).' },
        { name: 'tarfile', desc: 'Read and write tar archive files (TarFile).' },
        { name: 'requests', desc: 'HTTP library for human beings (get, post, put, delete, Session).' },
        { name: 'numpy', desc: 'Fundamental package for scientific computing with Python (arrays, matrices, math).' },
        { name: 'pandas', desc: 'Data manipulation and analysis library (DataFrame, Series, read_csv).' },
        { name: 'matplotlib', desc: 'Comprehensive library for creating static, animated, and interactive visualizations.' },
        { name: 'scipy', desc: 'Fundamental library for scientific computing and technical computing.' },
        { name: 'sklearn', desc: 'Simple and efficient tools for predictive data analysis and machine learning.' },
        { name: 'torch', desc: 'PyTorch deep learning framework (tensors, neural networks, autograd).' },
        { name: 'flask', desc: 'Lightweight WSGI web application framework (Flask, request, jsonify, render_template).' },
        { name: 'fastapi', desc: 'Modern, fast (high-performance) web framework for building APIs with Python 3.8+.' },
        { name: 'pydantic', desc: 'Data validation and settings management using Python type annotations (BaseModel).' },
        { name: 'bs4', desc: 'Beautiful Soup library for pulling data out of HTML and XML files (BeautifulSoup).' },
        { name: 'pytest', desc: 'Framework making it easy to write small, readable tests.' }
    ];

    // ---- 2. MODULE MEMBERS MAP (DOT COMPLETION) ----
    const MODULE_MEMBERS = {
        'os': [
            { name: 'getcwd', sig: '()', snippet: 'getcwd()', doc: 'Return a unicode string representing the current working directory.' },
            { name: 'listdir', sig: '(path=".")', snippet: 'listdir(${1:path="."})', doc: 'Return a list containing the names of the entries in the directory.' },
            { name: 'mkdir', sig: '(path, mode=0o777)', snippet: 'mkdir(${1:path})', doc: 'Create a directory named path with numeric mode mode.' },
            { name: 'makedirs', sig: '(name, mode=0o777, exist_ok=False)', snippet: 'makedirs(${1:name}, exist_ok=${2:True})', doc: 'Super-mkdir: create-directory recursively.' },
            { name: 'remove', sig: '(path)', snippet: 'remove(${1:path})', doc: 'Remove (delete) the file path.' },
            { name: 'unlink', sig: '(path)', snippet: 'unlink(${1:path})', doc: 'Remove a file (same as remove).' },
            { name: 'rename', sig: '(src, dst)', snippet: 'rename(${1:src}, ${2:dst})', doc: 'Rename the file or directory src to dst.' },
            { name: 'replace', sig: '(src, dst)', snippet: 'replace(${1:src}, ${2:dst})', doc: 'Rename src to dst, atomically replacing dst if it exists.' },
            { name: 'rmdir', sig: '(path)', snippet: 'rmdir(${1:path})', doc: 'Remove (delete) the directory path.' },
            { name: 'environ', sig: 'mapping', snippet: 'environ', kind: 'Field', doc: 'A mapping object representing the string environment variables.' },
            { name: 'getenv', sig: '(key, default=None)', snippet: 'getenv("${1:KEY}"${2:, default=None})', doc: 'Get an environment variable, return None if it doesn\'t exist.' },
            { name: 'putenv', sig: '(key, value)', snippet: 'putenv("${1:KEY}", "${2:VALUE}")', doc: 'Change or add an environment variable.' },
            { name: 'system', sig: '(command)', snippet: 'system(${1:command})', doc: 'Execute the command (a string) in a subshell.' },
            { name: 'walk', sig: '(top, topdown=True, onerror=None, followlinks=False)', snippet: 'walk(${1:top})', doc: 'Directory tree generator: yields (dirpath, dirnames, filenames).' },
            { name: 'stat', sig: '(path)', snippet: 'stat(${1:path})', doc: 'Perform a stat system call on the given path.' },
            { name: 'chmod', sig: '(path, mode)', snippet: 'chmod(${1:path}, ${2:mode})', doc: 'Change the mode (permissions) of path.' },
            { name: 'chdir', sig: '(path)', snippet: 'chdir(${1:path})', doc: 'Change the current working directory to path.' },
            { name: 'cpu_count', sig: '()', snippet: 'cpu_count()', doc: 'Return the number of CPUs in the system (or None if undetermined).' },
            { name: 'urandom', sig: '(size)', snippet: 'urandom(${1:size})', doc: 'Return a bytes object containing random bytes suitable for cryptographic use.' },
            { name: 'path', sig: 'module', snippet: 'path', kind: 'Module', doc: 'Common pathname manipulations module.' },
            { name: 'linesep', sig: 'str', snippet: 'linesep', kind: 'Field', doc: 'Line separator string ("\\n" or "\\r\\n").' },
            { name: 'sep', sig: 'str', snippet: 'sep', kind: 'Field', doc: 'File path separator character ("/" or "\\").' }
        ],
        'os.path': [
            { name: 'join', sig: '(path, *paths)', snippet: 'join(${1:path}, ${2:*paths})', doc: 'Join one or more path components intelligently.' },
            { name: 'split', sig: '(path)', snippet: 'split(${1:path})', doc: 'Split a pathname into pair (head, tail).' },
            { name: 'splitext', sig: '(path)', snippet: 'splitext(${1:path})', doc: 'Split the extension from a pathname into (root, ext).' },
            { name: 'basename', sig: '(path)', snippet: 'basename(${1:path})', doc: 'Returns the final component of a pathname.' },
            { name: 'dirname', sig: '(path)', snippet: 'dirname(${1:path})', doc: 'Returns the directory component of a pathname.' },
            { name: 'abspath', sig: '(path)', snippet: 'abspath(${1:path})', doc: 'Return an absolute or normalized pathname.' },
            { name: 'realpath', sig: '(path)', snippet: 'realpath(${1:path})', doc: 'Return the canonical path of the specified filename, eliminating symlinks.' },
            { name: 'exists', sig: '(path)', snippet: 'exists(${1:path})', doc: 'Test whether a path exists. Returns False for broken symbolic links.' },
            { name: 'isfile', sig: '(path)', snippet: 'isfile(${1:path})', doc: 'Test whether a path is a regular file.' },
            { name: 'isdir', sig: '(path)', snippet: 'isdir(${1:path})', doc: 'Test whether a path is a directory.' },
            { name: 'islink', sig: '(path)', snippet: 'islink(${1:path})', doc: 'Test whether a path is a symbolic link.' },
            { name: 'getsize', sig: '(path)', snippet: 'getsize(${1:path})', doc: 'Return the size of a file, in bytes.' },
            { name: 'getmtime', sig: '(path)', snippet: 'getmtime(${1:path})', doc: 'Return the time of last modification of path.' },
            { name: 'isabs', sig: '(path)', snippet: 'isabs(${1:path})', doc: 'Test whether a path is absolute.' },
            { name: 'expanduser', sig: '(path)', snippet: 'expanduser(${1:path})', doc: 'Expand ~ and ~user constructions in path.' },
            { name: 'normpath', sig: '(path)', snippet: 'normpath(${1:path})', doc: 'Normalize a pathname by collapsing redundant separators and up-level references.' }
        ],
        'sys': [
            { name: 'argv', sig: 'list[str]', snippet: 'argv', kind: 'Field', doc: 'The list of command line arguments passed to a Python script.' },
            { name: 'exit', sig: '([arg])', snippet: 'exit(${1:0})', doc: 'Exit from Python by raising SystemExit(arg).' },
            { name: 'version', sig: 'str', snippet: 'version', kind: 'Field', doc: 'A string containing the version number of the Python interpreter.' },
            { name: 'version_info', sig: 'tuple', snippet: 'version_info', kind: 'Field', doc: 'A tuple containing the five components of the version number.' },
            { name: 'path', sig: 'list[str]', snippet: 'path', kind: 'Field', doc: 'A list of strings that specifies the search path for modules.' },
            { name: 'platform', sig: 'str', snippet: 'platform', kind: 'Field', doc: 'Platform identifier (e.g. "linux", "win32", "darwin").' },
            { name: 'modules', sig: 'dict', snippet: 'modules', kind: 'Field', doc: 'A dictionary that maps module names to modules which have already been loaded.' },
            { name: 'stdout', sig: 'TextIO', snippet: 'stdout', kind: 'Field', doc: 'Standard output stream.' },
            { name: 'stdin', sig: 'TextIO', snippet: 'stdin', kind: 'Field', doc: 'Standard input stream.' },
            { name: 'stderr', sig: 'TextIO', snippet: 'stderr', kind: 'Field', doc: 'Standard error stream.' },
            { name: 'getsizeof', sig: '(object[, default])', snippet: 'getsizeof(${1:object})', doc: 'Return the size of object in bytes.' },
            { name: 'setrecursionlimit', sig: '(limit)', snippet: 'setrecursionlimit(${1:limit})', doc: 'Set the maximum depth of the Python interpreter stack.' },
            { name: 'getrecursionlimit', sig: '()', snippet: 'getrecursionlimit()', doc: 'Return the current value of the maximum depth of the Python interpreter stack.' },
            { name: 'executable', sig: 'str', snippet: 'executable', kind: 'Field', doc: 'A string giving the absolute path of the executable binary for Python.' }
        ],
        'math': [
            { name: 'sqrt', sig: '(x)', snippet: 'sqrt(${1:x})', doc: 'Return the square root of x.' },
            { name: 'ceil', sig: '(x)', snippet: 'ceil(${1:x})', doc: 'Return the ceiling of x, the smallest integer >= x.' },
            { name: 'floor', sig: '(x)', snippet: 'floor(${1:x})', doc: 'Return the floor of x, the largest integer <= x.' },
            { name: 'trunc', sig: '(x)', snippet: 'trunc(${1:x})', doc: 'Truncate the Real value x to the Nearest Integral value towards 0.' },
            { name: 'fabs', sig: '(x)', snippet: 'fabs(${1:x})', doc: 'Return the absolute value of the float x.' },
            { name: 'factorial', sig: '(n)', snippet: 'factorial(${1:n})', doc: 'Find n!. Raise ValueError if n < 0 or n is not integral.' },
            { name: 'gcd', sig: '(*integers)', snippet: 'gcd(${1:a}, ${2:b})', doc: 'Greatest Common Divisor of arguments.' },
            { name: 'lcm', sig: '(*integers)', snippet: 'lcm(${1:a}, ${2:b})', doc: 'Least Common Multiple of arguments.' },
            { name: 'pow', sig: '(x, y)', snippet: 'pow(${1:x}, ${2:y})', doc: 'Return x raised to the power y.' },
            { name: 'exp', sig: '(x)', snippet: 'exp(${1:x})', doc: 'Return e raised to the power x.' },
            { name: 'log', sig: '(x[, base=math.e])', snippet: 'log(${1:x}${2:, base})', doc: 'Return the logarithm of x to the given base (default natural).' },
            { name: 'log2', sig: '(x)', snippet: 'log2(${1:x})', doc: 'Return the base 2 logarithm of x.' },
            { name: 'log10', sig: '(x)', snippet: 'log10(${1:x})', doc: 'Return the base 10 logarithm of x.' },
            { name: 'sin', sig: '(x)', snippet: 'sin(${1:x})', doc: 'Return the sine of x (measured in radians).' },
            { name: 'cos', sig: '(x)', snippet: 'cos(${1:x})', doc: 'Return the cosine of x (measured in radians).' },
            { name: 'tan', sig: '(x)', snippet: 'tan(${1:x})', doc: 'Return the tangent of x (measured in radians).' },
            { name: 'asin', sig: '(x)', snippet: 'asin(${1:x})', doc: 'Return the arc sine of x (in radians).' },
            { name: 'acos', sig: '(x)', snippet: 'acos(${1:x})', doc: 'Return the arc cosine of x (in radians).' },
            { name: 'atan', sig: '(x)', snippet: 'atan(${1:x})', doc: 'Return the arc tangent of x (in radians).' },
            { name: 'atan2', sig: '(y, x)', snippet: 'atan2(${1:y}, ${2:x})', doc: 'Return the arc tangent (measured in radians) of y/x.' },
            { name: 'degrees', sig: '(x)', snippet: 'degrees(${1:x})', doc: 'Convert angle x from radians to degrees.' },
            { name: 'radians', sig: '(x)', snippet: 'radians(${1:x})', doc: 'Convert angle x from degrees to radians.' },
            { name: 'hypot', sig: '(*coordinates)', snippet: 'hypot(${1:x}, ${2:y})', doc: 'Return the Euclidean norm, sqrt(sum(x**2 for x in coordinates)).' },
            { name: 'comb', sig: '(n, k)', snippet: 'comb(${1:n}, ${2:k})', doc: 'Number of ways to choose k items from n items without repetition.' },
            { name: 'perm', sig: '(n, k=None)', snippet: 'perm(${1:n}${2:, k})', doc: 'Number of ways to choose k items from n items without repetition and with order.' },
            { name: 'isclose', sig: '(a, b, *, rel_tol=1e-09, abs_tol=0.0)', snippet: 'isclose(${1:a}, ${2:b})', doc: 'Determine whether two floating point numbers are close in value.' },
            { name: 'isfinite', sig: '(x)', snippet: 'isfinite(${1:x})', doc: 'Return True if x is neither an infinity nor a NaN.' },
            { name: 'isinf', sig: '(x)', snippet: 'isinf(${1:x})', doc: 'Return True if x is a positive or negative infinity.' },
            { name: 'isnan', sig: '(x)', snippet: 'isnan(${1:x})', doc: 'Return True if x is a NaN (not a number).' },
            { name: 'pi', sig: 'float', snippet: 'pi', kind: 'Field', doc: 'The mathematical constant π = 3.141592...' },
            { name: 'e', sig: 'float', snippet: 'e', kind: 'Field', doc: 'The mathematical constant e = 2.718281...' },
            { name: 'tau', sig: 'float', snippet: 'tau', kind: 'Field', doc: 'The mathematical constant τ = 2π = 6.283185...' },
            { name: 'inf', sig: 'float', snippet: 'inf', kind: 'Field', doc: 'A floating-point positive infinity.' },
            { name: 'nan', sig: 'float', snippet: 'nan', kind: 'Field', doc: 'A floating-point "not a number" (NaN) value.' }
        ],
        'json': [
            { name: 'loads', sig: '(s, *, cls=None, object_hook=None, ...)', snippet: 'loads(${1:json_string})', doc: 'Deserialize s (a str, bytes or bytearray instance containing a JSON document) to a Python object.' },
            { name: 'dumps', sig: '(obj, *, indent=None, sort_keys=False, ...)', snippet: 'dumps(${1:obj}, indent=${2:2})', doc: 'Serialize obj to a JSON formatted str.' },
            { name: 'load', sig: '(fp, *, cls=None, object_hook=None, ...)', snippet: 'load(${1:fp})', doc: 'Deserialize fp (a .read()-supporting file-like object containing a JSON document) to a Python object.' },
            { name: 'dump', sig: '(obj, fp, *, indent=None, sort_keys=False, ...)', snippet: 'dump(${1:obj}, ${2:fp}, indent=${3:2})', doc: 'Serialize obj as a JSON formatted stream to fp (a .write()-supporting file-like object).' },
            { name: 'JSONDecoder', sig: 'class', snippet: 'JSONDecoder()', kind: 'Class', doc: 'Simple JSON decoder.' },
            { name: 'JSONEncoder', sig: 'class', snippet: 'JSONEncoder()', kind: 'Class', doc: 'Extensible JSON encoder for Python data structures.' }
        ],
        'random': [
            { name: 'randint', sig: '(a, b)', snippet: 'randint(${1:a}, ${2:b})', doc: 'Return random integer in range [a, b], including both end points.' },
            { name: 'randrange', sig: '(start, stop=None, step=1)', snippet: 'randrange(${1:start}${2:, stop})', doc: 'Choose a random item from range(start, stop[, step]).' },
            { name: 'choice', sig: '(seq)', snippet: 'choice(${1:seq})', doc: 'Choose a random element from a non-empty sequence.' },
            { name: 'choices', sig: '(population, weights=None, *, k=1)', snippet: 'choices(${1:population}, k=${2:1})', doc: 'Return a k sized list of population elements chosen with replacement.' },
            { name: 'sample', sig: '(population, k)', snippet: 'sample(${1:population}, ${2:k})', doc: 'Chooses k unique random elements from a population sequence or set.' },
            { name: 'shuffle', sig: '(x)', snippet: 'shuffle(${1:x})', doc: 'Shuffle list x in place, and return None.' },
            { name: 'random', sig: '()', snippet: 'random()', doc: 'Return the next random floating point number in the range [0.0, 1.0).' },
            { name: 'uniform', sig: '(a, b)', snippet: 'uniform(${1:a}, ${2:b})', doc: 'Get a random number in the range [a, b) or [a, b] depending on rounding.' },
            { name: 'seed', sig: '(a=None, version=2)', snippet: 'seed(${1:a})', doc: 'Initialize the internal state of the random number generator.' }
        ],
        're': [
            { name: 'compile', sig: '(pattern, flags=0)', snippet: 'compile(r"${1:pattern}")', doc: 'Compile a regular expression pattern into a regular expression object.' },
            { name: 'search', sig: '(pattern, string, flags=0)', snippet: 'search(r"${1:pattern}", ${2:string})', doc: 'Scan through string looking for a match to the pattern, returning a Match object.' },
            { name: 'match', sig: '(pattern, string, flags=0)', snippet: 'match(r"${1:pattern}", ${2:string})', doc: 'Try to apply the pattern at the start of the string, returning a Match object.' },
            { name: 'fullmatch', sig: '(pattern, string, flags=0)', snippet: 'fullmatch(r"${1:pattern}", ${2:string})', doc: 'Try to apply the pattern to the entire string, returning a Match object.' },
            { name: 'split', sig: '(pattern, string, maxsplit=0, flags=0)', snippet: 'split(r"${1:pattern}", ${2:string})', doc: 'Split string by the occurrences of pattern.' },
            { name: 'findall', sig: '(pattern, string, flags=0)', snippet: 'findall(r"${1:pattern}", ${2:string})', doc: 'Return all non-overlapping matches of pattern in string, as a list of strings or tuples.' },
            { name: 'finditer', sig: '(pattern, string, flags=0)', snippet: 'finditer(r"${1:pattern}", ${2:string})', doc: 'Return an iterator yielding Match objects over all non-overlapping matches.' },
            { name: 'sub', sig: '(pattern, repl, string, count=0, flags=0)', snippet: 'sub(r"${1:pattern}", "${2:replacement}", ${3:string})', doc: 'Return the string obtained by replacing the leftmost non-overlapping occurrences of pattern.' },
            { name: 'escape', sig: '(pattern)', snippet: 'escape(${1:pattern})', doc: 'Escape special characters in a string.' },
            { name: 'IGNORECASE', sig: 'int', snippet: 'IGNORECASE', kind: 'Field', doc: 'Regex flag for case-insensitive matching.' },
            { name: 'MULTILINE', sig: 'int', snippet: 'MULTILINE', kind: 'Field', doc: 'Regex flag for multi-line matching (^ and $ match per line).' },
            { name: 'DOTALL', sig: 'int', snippet: 'DOTALL', kind: 'Field', doc: 'Regex flag allowing dot (.) to match newline characters.' }
        ],
        'datetime': [
            { name: 'datetime', sig: 'class', snippet: 'datetime', kind: 'Class', doc: 'Class providing date and time manipulation attributes and methods.' },
            { name: 'date', sig: 'class', snippet: 'date', kind: 'Class', doc: 'Represents a date (year, month and day) in an idealized calendar.' },
            { name: 'time', sig: 'class', snippet: 'time', kind: 'Class', doc: 'Represents a (local) time of day, independent of any particular day.' },
            { name: 'timedelta', sig: 'class', snippet: 'timedelta(${1:days=0, seconds=0, hours=0})', kind: 'Class', doc: 'Represents a duration, the difference between two dates or times.' },
            { name: 'timezone', sig: 'class', snippet: 'timezone', kind: 'Class', doc: 'Represents a timezone as an offset from UTC.' }
        ],
        'datetime.datetime': [
            { name: 'now', sig: '(tz=None)', snippet: 'now(${1:tz=None})', doc: 'Returns the current local date and time.' },
            { name: 'utcnow', sig: '()', snippet: 'utcnow()', doc: 'Return the current UTC date and time.' },
            { name: 'strptime', sig: '(date_string, format)', snippet: 'strptime(${1:date_string}, "${2:%Y-%m-%d %H:%M:%S}")', doc: 'Return a datetime corresponding to date_string, parsed according to format.' },
            { name: 'strftime', sig: '(format)', snippet: 'strftime("${1:%Y-%m-%d %H:%M:%S}")', doc: 'Return a string representing the date and time, controlled by an explicit format string.' },
            { name: 'fromtimestamp', sig: '(timestamp, tz=None)', snippet: 'fromtimestamp(${1:timestamp})', doc: 'Return the local date and time corresponding to the POSIX timestamp.' },
            { name: 'combine', sig: '(date, time, tzinfo=self.tzinfo)', snippet: 'combine(${1:date}, ${2:time})', doc: 'Return a new datetime object whose date components equal given date.' }
        ],
        'collections': [
            { name: 'defaultdict', sig: '([default_factory[, ...]])', snippet: 'defaultdict(${1:list})', kind: 'Class', doc: 'Returns a new dictionary-like object that calls a factory function to supply missing values.' },
            { name: 'Counter', sig: '([iterable-or-mapping])', snippet: 'Counter(${1:iterable})', kind: 'Class', doc: 'Dict subclass for counting hashable items. Sometimes called a bag or multiset.' },
            { name: 'deque', sig: '([iterable[, maxlen]])', snippet: 'deque(${1:iterable}${2:, maxlen=None})', kind: 'Class', doc: 'Returns a new deque object initialized left-to-right (using append()) with data from iterable.' },
            { name: 'namedtuple', sig: '(typename, field_names, ...)', snippet: 'namedtuple("${1:TypeName}", [${2:"field1", "field2"}])', doc: 'Returns a new subclass of tuple with named fields.' },
            { name: 'OrderedDict', sig: '([items])', snippet: 'OrderedDict()', kind: 'Class', doc: 'Dict subclass that remembers the order in which its contents were added.' }
        ],
        'itertools': [
            { name: 'chain', sig: '(*iterables)', snippet: 'chain(${1:*iterables})', doc: 'Chain multiple iterables together into a single sequence.' },
            { name: 'product', sig: '(*iterables, repeat=1)', snippet: 'product(${1:*iterables}${2:, repeat=1})', doc: 'Cartesian product of input iterables. Equivalent to nested for-loops.' },
            { name: 'permutations', sig: '(iterable, r=None)', snippet: 'permutations(${1:iterable}${2:, r})', doc: 'Return successive r length permutations of elements in the iterable.' },
            { name: 'combinations', sig: '(iterable, r)', snippet: 'combinations(${1:iterable}, ${2:r})', doc: 'Return r length subsequences of elements from the input iterable.' },
            { name: 'combinations_with_replacement', sig: '(iterable, r)', snippet: 'combinations_with_replacement(${1:iterable}, ${2:r})', doc: 'Return r length subsequences with replacement.' },
            { name: 'cycle', sig: '(iterable)', snippet: 'cycle(${1:iterable})', doc: 'Cycle through an iterable indefinitely.' },
            { name: 'count', sig: '(start=0, step=1)', snippet: 'count(${1:start=0}${2:, step=1})', doc: 'Make an iterator that returns evenly spaced values starting with number start.' },
            { name: 'islice', sig: '(iterable, [start,] stop [, step])', snippet: 'islice(${1:iterable}, ${2:stop})', doc: 'Make an iterator that returns selected elements from the iterable.' },
            { name: 'groupby', sig: '(iterable, key=None)', snippet: 'groupby(${1:iterable}${2:, key=None})', doc: 'Make an iterator that returns consecutive keys and groups from the iterable.' },
            { name: 'accumulate', sig: '(iterable[, func, *, initial=None])', snippet: 'accumulate(${1:iterable})', doc: 'Make an iterator that returns accumulated sums, or accumulated results of other binary functions.' }
        ],
        'pathlib': [
            { name: 'Path', sig: '(*args)', snippet: 'Path(${1:"."})', kind: 'Class', doc: 'PurePath subclass representing a concrete path in your system.' },
            { name: 'PosixPath', sig: 'class', snippet: 'PosixPath', kind: 'Class', doc: 'Path subclass for non-Windows filesystems.' },
            { name: 'WindowsPath', sig: 'class', snippet: 'WindowsPath', kind: 'Class', doc: 'Path subclass for Windows systems.' }
        ],
        'time': [
            { name: 'time', sig: '()', snippet: 'time()', doc: 'Return the current time in seconds since the Epoch (1970-01-01 00:00:00 UTC).' },
            { name: 'sleep', sig: '(secs)', snippet: 'sleep(${1:seconds})', doc: 'Delay execution for a given number of seconds.' },
            { name: 'perf_counter', sig: '()', snippet: 'perf_counter()', doc: 'Return the value (in fractional seconds) of a performance counter.' },
            { name: 'monotonic', sig: '()', snippet: 'monotonic()', doc: 'Return the value (in fractional seconds) of a monotonic clock.' },
            { name: 'strftime', sig: '(format[, t])', snippet: 'strftime("${1:%Y-%m-%d %H:%M:%S}")', doc: 'Convert a tuple or struct_time representing a time as returned by gmtime() or localtime() to a string.' }
        ],
        'requests': [
            { name: 'get', sig: '(url, params=None, **kwargs)', snippet: 'get(${1:url}${2:, params=None})', doc: 'Sends a GET request. Returns Response object.' },
            { name: 'post', sig: '(url, data=None, json=None, **kwargs)', snippet: 'post(${1:url}${2:, json=data})', doc: 'Sends a POST request. Returns Response object.' },
            { name: 'put', sig: '(url, data=None, **kwargs)', snippet: 'put(${1:url}${2:, data=None})', doc: 'Sends a PUT request.' },
            { name: 'delete', sig: '(url, **kwargs)', snippet: 'delete(${1:url})', doc: 'Sends a DELETE request.' },
            { name: 'patch', sig: '(url, data=None, **kwargs)', snippet: 'patch(${1:url}${2:, data=None})', doc: 'Sends a PATCH request.' },
            { name: 'Session', sig: '()', snippet: 'Session()', kind: 'Class', doc: 'Provides cookie persistence, connection-pooling, and configuration.' }
        ],
        'numpy': [
            { name: 'array', sig: '(object, dtype=None)', snippet: 'array(${1:object})', doc: 'Create an array.' },
            { name: 'zeros', sig: '(shape, dtype=float)', snippet: 'zeros(${1:shape})', doc: 'Return a new array of given shape and type, filled with zeros.' },
            { name: 'ones', sig: '(shape, dtype=float)', snippet: 'ones(${1:shape})', doc: 'Return a new array of given shape and type, filled with ones.' },
            { name: 'empty', sig: '(shape, dtype=float)', snippet: 'empty(${1:shape})', doc: 'Return a new uninitialized array of given shape and type.' },
            { name: 'arange', sig: '([start,] stop[, step,], dtype=None)', snippet: 'arange(${1:stop})', doc: 'Return evenly spaced values within a given interval.' },
            { name: 'linspace', sig: '(start, stop, num=50)', snippet: 'linspace(${1:start}, ${2:stop}, ${3:num=50})', doc: 'Return evenly spaced numbers over a specified interval.' },
            { name: 'mean', sig: '(a, axis=None)', snippet: 'mean(${1:a})', doc: 'Compute the arithmetic mean along the specified axis.' },
            { name: 'std', sig: '(a, axis=None)', snippet: 'std(${1:a})', doc: 'Compute the standard deviation along the specified axis.' },
            { name: 'sum', sig: '(a, axis=None)', snippet: 'sum(${1:a})', doc: 'Sum of array elements over a given axis.' },
            { name: 'dot', sig: '(a, b)', snippet: 'dot(${1:a}, ${2:b})', doc: 'Dot product of two arrays.' },
            { name: 'reshape', sig: '(a, newshape)', snippet: 'reshape(${1:a}, ${2:newshape})', doc: 'Gives a new shape to an array without changing its data.' },
            { name: 'concatenate', sig: '((a1, a2, ...), axis=0)', snippet: 'concatenate((${1:a1}, ${2:a2}))', doc: 'Join a sequence of arrays along an existing axis.' }
        ],
        'pandas': [
            { name: 'DataFrame', sig: '(data=None, index=None, columns=None)', snippet: 'DataFrame(${1:data})', kind: 'Class', doc: 'Two-dimensional, size-mutable, potentially heterogeneous tabular data.' },
            { name: 'Series', sig: '(data=None, index=None, dtype=None)', snippet: 'Series(${1:data})', kind: 'Class', doc: 'One-dimensional ndarray with axis labels (including time series).' },
            { name: 'read_csv', sig: '(filepath_or_buffer, ...)', snippet: 'read_csv("${1:filename.csv}")', doc: 'Read a comma-separated values (csv) file into DataFrame.' },
            { name: 'read_excel', sig: '(io, ...)', snippet: 'read_excel("${1:filename.xlsx}")', doc: 'Read an Excel file into a pandas DataFrame.' },
            { name: 'read_json', sig: '(path_or_buf, ...)', snippet: 'read_json("${1:filename.json}")', doc: 'Convert a JSON string to pandas object.' },
            { name: 'read_sql', sig: '(sql, con, ...)', snippet: 'read_sql(${1:query}, ${2:con})', doc: 'Read SQL query or database table into a DataFrame.' },
            { name: 'concat', sig: '(objs, axis=0, ...)', snippet: 'concat([${1:df1}, ${2:df2}])', doc: 'Concatenate pandas objects along a particular axis.' },
            { name: 'merge', sig: '(left, right, how="inner", on=None)', snippet: 'merge(${1:left}, ${2:right}, on="${3:key}")', doc: 'Merge DataFrame or named Series objects with a database-style join.' }
        ],
        'matplotlib.pyplot': [
            { name: 'plot', sig: '(*args, **kwargs)', snippet: 'plot(${1:x}, ${2:y})', doc: 'Plot y versus x as lines and/or markers.' },
            { name: 'scatter', sig: '(x, y, s=None, c=None, marker=None)', snippet: 'scatter(${1:x}, ${2:y})', doc: 'A scatter plot of y vs. x with varying marker size and/or color.' },
            { name: 'bar', sig: '(x, height, width=0.8, ...)', snippet: 'bar(${1:x}, ${2:height})', doc: 'Make a bar plot.' },
            { name: 'hist', sig: '(x, bins=None, ...)', snippet: 'hist(${1:x}, bins=${2:10})', doc: 'Compute and plot a histogram.' },
            { name: 'title', sig: '(label, fontdict=None, loc=None)', snippet: 'title("${1:Title}")', doc: 'Set a title for the Axes.' },
            { name: 'xlabel', sig: '(xlabel, fontdict=None, labelpad=None)', snippet: 'xlabel("${1:X Axis}")', doc: 'Set the label for the x-axis.' },
            { name: 'ylabel', sig: '(ylabel, fontdict=None, labelpad=None)', snippet: 'ylabel("${1:Y Axis}")', doc: 'Set the label for the y-axis.' },
            { name: 'legend', sig: '(*args, **kwargs)', snippet: 'legend()', doc: 'Place a legend on the Axes.' },
            { name: 'grid', sig: '(visible=None, which="major", axis="both")', snippet: 'grid(True)', doc: 'Configure the grid lines.' },
            { name: 'show', sig: '(*args, **kwargs)', snippet: 'show()', doc: 'Display all open figures.' },
            { name: 'savefig', sig: '(fname, **kwargs)', snippet: 'savefig("${1:plot.png}")', doc: 'Save the current figure.' },
            { name: 'figure', sig: '(num=None, figsize=None, dpi=None)', snippet: 'figure(figsize=(${1:8}, ${2:6}))', doc: 'Create a new figure, or activate an existing figure.' },
            { name: 'subplots', sig: '(nrows=1, ncols=1, ...)', snippet: 'subplots(${1:nrows=1}, ${2:ncols=1})', doc: 'Create a figure and a set of subplots.' }
        ]
    };

    // Aliases
    MODULE_MEMBERS['np'] = MODULE_MEMBERS['numpy'];
    MODULE_MEMBERS['pd'] = MODULE_MEMBERS['pandas'];
    MODULE_MEMBERS['plt'] = MODULE_MEMBERS['matplotlib.pyplot'];

    // ---- 3. PYTHON BUILT-IN FUNCTIONS (70+) ----
    const PYTHON_BUILTINS = [
        { name: 'print', sig: '(*objects, sep=" ", end="\\n", file=sys.stdout, flush=False)', snippet: 'print(${1:value})', doc: 'Prints the values to a stream, or to sys.stdout by default.' },
        { name: 'len', sig: '(s)', snippet: 'len(${1:s})', doc: 'Return the length (the number of items) of an object (sequence or collection).' },
        { name: 'range', sig: '([start,] stop[, step])', snippet: 'range(${1:stop})', doc: 'Return an immutable sequence of numbers from start to stop by step.' },
        { name: 'enumerate', sig: '(iterable, start=0)', snippet: 'enumerate(${1:iterable}${2:, start=0})', doc: 'Return an enumerate object yielding pairs containing a count and the value yielded by iterable.' },
        { name: 'zip', sig: '(*iterables, strict=False)', snippet: 'zip(${1:iter1}, ${2:iter2})', doc: 'Iterate over several iterables in parallel, producing tuples with an item from each.' },
        { name: 'map', sig: '(func, *iterables)', snippet: 'map(${1:func}, ${2:iterable})', doc: 'Make an iterator that computes the function using arguments from each of the iterables.' },
        { name: 'filter', sig: '(function_or_none, iterable)', snippet: 'filter(${1:function}, ${2:iterable})', doc: 'Construct an iterator from elements of iterable for which function returns true.' },
        { name: 'sorted', sig: '(iterable, *, key=None, reverse=False)', snippet: 'sorted(${1:iterable}${2:, key=None, reverse=False})', doc: 'Return a new list containing all items from the iterable in ascending order.' },
        { name: 'reversed', sig: '(seq)', snippet: 'reversed(${1:seq})', doc: 'Return a reverse iterator over the values of the given sequence.' },
        { name: 'open', sig: '(file, mode="r", buffering=-1, encoding=None, ...)', snippet: 'open("${1:filename}", "${2:r}")', doc: 'Open file and return a stream.' },
        { name: 'isinstance', sig: '(object, classinfo)', snippet: 'isinstance(${1:object}, ${2:classinfo})', doc: 'Return whether an object is an instance of a class or of a subclass thereof.' },
        { name: 'issubclass', sig: '(class, classinfo)', snippet: 'issubclass(${1:class}, ${2:classinfo})', doc: 'Return whether \'class\' is a derived from another class or is the same class.' },
        { name: 'type', sig: '(object) or type(name, bases, dict)', snippet: 'type(${1:object})', doc: 'With one argument, return the type of an object. With three arguments, return a new type object.' },
        { name: 'sum', sig: '(iterable, /, start=0)', snippet: 'sum(${1:iterable}${2:, 0})', doc: 'Return the sum of a \'start\' value plus an iterable of numbers.' },
        { name: 'min', sig: '(iterable, *[, default=obj, key=func])', snippet: 'min(${1:iterable})', doc: 'With a single iterable argument, return its smallest item.' },
        { name: 'max', sig: '(iterable, *[, default=obj, key=func])', snippet: 'max(${1:iterable})', doc: 'With a single iterable argument, return its largest item.' },
        { name: 'abs', sig: '(x)', snippet: 'abs(${1:x})', doc: 'Return the absolute value of the argument.' },
        { name: 'round', sig: '(number, ndigits=None)', snippet: 'round(${1:number}${2:, ndigits})', doc: 'Round a number to a given precision in decimal digits.' },
        { name: 'int', sig: '(x=0, base=10)', snippet: 'int(${1:x})', doc: 'Convert a number or string to an integer, or return 0 if no arguments are given.' },
        { name: 'float', sig: '(x=0.0)', snippet: 'float(${1:x})', doc: 'Convert a string or number to a floating point number, if possible.' },
        { name: 'str', sig: '(object="")', snippet: 'str(${1:object})', doc: 'Create a new string object from the given object.' },
        { name: 'bool', sig: '(x=False)', snippet: 'bool(${1:x})', doc: 'Returns True when the argument x is true, False otherwise.' },
        { name: 'list', sig: '([iterable])', snippet: 'list(${1:iterable})', doc: 'Built-in mutable sequence.' },
        { name: 'dict', sig: '([mapping_or_iterable, **kwargs])', snippet: 'dict(${1:iterable})', doc: 'Built-in associative dictionary container.' },
        { name: 'set', sig: '([iterable])', snippet: 'set(${1:iterable})', doc: 'Build an unordered collection of unique elements.' },
        { name: 'tuple', sig: '([iterable])', snippet: 'tuple(${1:iterable})', doc: 'Built-in immutable sequence.' },
        { name: 'frozenset', sig: '([iterable])', snippet: 'frozenset(${1:iterable})', doc: 'Build an immutable unordered collection of unique elements.' },
        { name: 'any', sig: '(iterable)', snippet: 'any(${1:iterable})', doc: 'Return True if bool(x) is True for any x in the iterable.' },
        { name: 'all', sig: '(iterable)', snippet: 'all(${1:iterable})', doc: 'Return True if bool(x) is True for all values x in the iterable.' },
        { name: 'dir', sig: '([object])', snippet: 'dir(${1:object})', doc: 'If called without arguments, return the names in the current scope. Otherwise, return alphabetized list of names comprising attributes.' },
        { name: 'help', sig: '([object])', snippet: 'help(${1:object})', doc: 'Invoke the built-in help system.' },
        { name: 'hasattr', sig: '(object, name)', snippet: 'hasattr(${1:object}, "${2:name}")', doc: 'Return whether the object has an attribute with the given name.' },
        { name: 'getattr', sig: '(object, name[, default])', snippet: 'getattr(${1:object}, "${2:name}"${3:, default})', doc: 'Get a named attribute from an object; getattr(x, \'y\') is equivalent to x.y.' },
        { name: 'setattr', sig: '(object, name, value)', snippet: 'setattr(${1:object}, "${2:name}", ${3:value})', doc: 'Sets the named attribute on the given object to the specified value.' },
        { name: 'delattr', sig: '(object, name)', snippet: 'delattr(${1:object}, "${2:name}")', doc: 'Deletes the named attribute from the given object.' },
        { name: 'id', sig: '(object)', snippet: 'id(${1:object})', doc: 'Return the identity of an object. This is guaranteed to be unique among simultaneously existing objects.' },
        { name: 'hash', sig: '(object)', snippet: 'hash(${1:object})', doc: 'Return the hash value for the given object.' },
        { name: 'input', sig: '([prompt])', snippet: 'input(${1:"Enter: "})', doc: 'Read a string from standard input. The trailing newline is stripped.' },
        { name: 'iter', sig: '(object[, sentinel])', snippet: 'iter(${1:object})', doc: 'Get an iterator from an object.' },
        { name: 'next', sig: '(iterator[, default])', snippet: 'next(${1:iterator}${2:, default})', doc: 'Return the next item from the iterator.' },
        { name: 'callable', sig: '(object)', snippet: 'callable(${1:object})', doc: 'Return whether the object is callable (i.e., some kind of function).' },
        { name: 'repr', sig: '(object)', snippet: 'repr(${1:object})', doc: 'Return the canonical string representation of the object.' },
        { name: 'format', sig: '(value[, format_spec])', snippet: 'format(${1:value}${2:, format_spec})', doc: 'Convert a value to a "formatted" representation, as controlled by format_spec.' },
        { name: 'divmod', sig: '(a, b)', snippet: 'divmod(${1:a}, ${2:b})', doc: 'Return the tuple (x//y, x%y). Invariant: div*y + mod == x.' },
        { name: 'pow', sig: '(base, exp[, mod])', snippet: 'pow(${1:base}, ${2:exp})', doc: 'Equivalent to base**exp with 2 arguments or (base**exp) % mod with 3 arguments.' },
        { name: 'chr', sig: '(i)', snippet: 'chr(${1:i})', doc: 'Return a Unicode string of one character with ordinal i; 0 <= i <= 0x10ffff.' },
        { name: 'ord', sig: '(c)', snippet: 'ord(${1:c})', doc: 'Return the integer ordinal of a one-character string.' },
        { name: 'bin', sig: '(number)', snippet: 'bin(${1:number})', doc: 'Return the binary representation of an integer.' },
        { name: 'hex', sig: '(number)', snippet: 'hex(${1:number})', doc: 'Return the hexadecimal representation of an integer.' },
        { name: 'oct', sig: '(number)', snippet: 'oct(${1:number})', doc: 'Return the octal representation of an integer.' },
        { name: 'super', sig: '([type[, object_or_type]])', snippet: 'super()', doc: 'Return a proxy object that delegates method calls to a parent or sibling class.' },
        { name: 'classmethod', sig: '(function)', snippet: 'classmethod(${1:function})', doc: 'Convert a function to be a class method.' },
        { name: 'staticmethod', sig: '(function)', snippet: 'staticmethod(${1:function})', doc: 'Convert a function to be a static method.' },
        { name: 'property', sig: '(fget=None, fset=None, fdel=None, doc=None)', snippet: 'property(${1:fget})', doc: 'Property attribute for managed class attributes.' },
        { name: 'globals', sig: '()', snippet: 'globals()', doc: 'Return the dictionary containing the current scope\'s global variables.' },
        { name: 'locals', sig: '()', snippet: 'locals()', doc: 'Return a dictionary containing the current scope\'s local variables.' },
        { name: 'vars', sig: '([object])', snippet: 'vars(${1:object})', doc: 'Return the __dict__ attribute for a module, class, instance, or any other object with a __dict__ attribute.' },
        { name: 'slice', sig: '([start,] stop[, step])', snippet: 'slice(${1:start}, ${2:stop}${3:, step})', doc: 'Create a slice object. This is used for extended slicing (e.g. a[0:10:2]).' }
    ];

    // ---- 4. PYTHON SNIPPETS & KEYWORDS ----
    const PYTHON_SNIPPETS = [
        {
            label: 'def',
            detail: 'Function definition',
            snippet: 'def ${1:function_name}(${2:params}):\n\t"""${3:Docstring}"""\n\t${0:pass}',
            doc: 'Define a new function with parameters and docstring.'
        },
        {
            label: 'defm',
            detail: 'Method definition',
            snippet: 'def ${1:method_name}(self${2:, params}):\n\t${0:pass}',
            doc: 'Define a class method taking `self`.'
        },
        {
            label: 'class',
            detail: 'Class definition',
            snippet: 'class ${1:ClassName}:\n\tdef __init__(self${2:, params}):\n\t\t${0:pass}',
            doc: 'Define a class with an `__init__` constructor.'
        },
        {
            label: 'ifmain',
            detail: 'if __name__ == "__main__":',
            snippet: 'if __name__ == "__main__":\n\t${0:main()}',
            doc: 'Standard boilerplate to execute code only when run directly as the main script.'
        },
        {
            label: 'try',
            detail: 'try / except block',
            snippet: 'try:\n\t${1:pass}\nexcept ${2:Exception} as ${3:e}:\n\t${0:print(f"Error: {e}")}',
            doc: 'Catch exceptions and handle runtime errors.'
        },
        {
            label: 'tryf',
            detail: 'try / except / finally block',
            snippet: 'try:\n\t${1:pass}\nexcept ${2:Exception} as ${3:e}:\n\t${4:print(f"Error: {e}")}\nfinally:\n\t${0:pass}',
            doc: 'Exception handling with a guaranteed cleanup `finally` clause.'
        },
        {
            label: 'with',
            detail: 'with open(...) as f:',
            snippet: 'with open("${1:filename.txt}", "${2:r}") as ${3:f}:\n\t${0:data = f.read()}',
            doc: 'Safely open files using a context manager.'
        },
        {
            label: 'for',
            detail: 'for item in iterable:',
            snippet: 'for ${1:item} in ${2:iterable}:\n\t${0:pass}',
            doc: 'Loop over items in an iterable collection.'
        },
        {
            label: 'fori',
            detail: 'for i in range(n):',
            snippet: 'for ${1:i} in range(${2:10}):\n\t${0:pass}',
            doc: 'Indexed loop using `range()`.'
        },
        {
            label: 'while',
            detail: 'while condition:',
            snippet: 'while ${1:condition}:\n\t${0:pass}',
            doc: 'Execute loop as long as condition evaluates to True.'
        },
        {
            label: 'listcomp',
            detail: 'List comprehension',
            snippet: '[${1:x} for ${1:x} in ${2:iterable} if ${3:condition}]',
            doc: 'Construct a new list in a concise declarative expression.'
        },
        {
            label: 'dictcomp',
            detail: 'Dictionary comprehension',
            snippet: '{${1:k}: ${2:v} for ${1:k}, ${2:v} in ${3:iterable}}',
            doc: 'Construct a dictionary in a concise declarative expression.'
        },
        {
            label: 'lambda',
            detail: 'Anonymous lambda function',
            snippet: 'lambda ${1:x}: ${0:x * 2}',
            doc: 'Create a small anonymous inline function.'
        },
        {
            label: 'asyncdef',
            detail: 'async def coroutine',
            snippet: 'async def ${1:coroutine_name}(${2:params}):\n\t${0:await pass}',
            doc: 'Define an asynchronous coroutine function.'
        },
        {
            label: 'property',
            detail: '@property getter & setter',
            snippet: '@property\ndef ${1:name}(self):\n\treturn self._${1:name}\n\n@${1:name}.setter\ndef ${1:name}(self, value):\n\tself._${1:name} = value',
            doc: 'Create managed property with getter and setter methods.'
        },
        {
            label: 'dataclass',
            detail: '@dataclass decorator',
            snippet: 'from dataclasses import dataclass\n\n@dataclass\nclass ${1:DataClass}:\n\t${2:field_name}: ${3:str}',
            doc: 'Generate special methods like __init__ and __repr__ automatically.'
        }
    ];

    // ---- 5. DYNAMIC WORKSPACE SYMBOLS EXTRACTOR ----
    // Extracts user functions, classes, and variables live across workspace files
    function extractWorkspaceSymbols(allFilesContent) {
        const functions = new Map();
        const classes = new Map();
        const variables = new Map();

        for (const code of allFilesContent) {
            if (!code || typeof code !== 'string') continue;

            // Match functions: def my_func(a, b=2):
            const funcRegex = /^[ \t]*def\s+([a-zA-Z_]\w*)\s*\(([^)]*)\):/gm;
            let match;
            while ((match = funcRegex.exec(code)) !== null) {
                const name = match[1];
                const args = match[2].trim();
                if (!name.startsWith('__')) {
                    functions.set(name, {
                        name: name,
                        sig: `(${args})`,
                        snippet: `${name}(${args ? '${1:' + args.split(',')[0].trim() + '}' : ''})`
                    });
                }
            }

            // Match classes: class MyClass(Base):
            const classRegex = /^[ \t]*class\s+([a-zA-Z_]\w*)(?:\(([^)]*)\))?:/gm;
            while ((match = classRegex.exec(code)) !== null) {
                const name = match[1];
                const base = match[2] ? match[2].trim() : '';
                classes.set(name, {
                    name: name,
                    base: base,
                    snippet: `${name}()`
                });
            }

            // Match top-level variable assignments: my_var = 42
            const varRegex = /^[a-zA-Z_]\w*(?=\s*=\s*[^=])/gm;
            while ((match = varRegex.exec(code)) !== null) {
                const name = match[0];
                if (!functions.has(name) && !classes.has(name)) {
                    variables.set(name, name);
                }
            }
        }

        return { functions, classes, variables };
    }

    // ---- 6. REGISTER MONACO INTELLISENSE PROVIDER ----
    function registerPythonIntellisense(monaco, getWorkspaceFiles) {
        if (!monaco || !monaco.languages) return;

        // Completion provider for Python
        monaco.languages.registerCompletionItemProvider('python', {
            triggerCharacters: ['.', ' ', '(', '@'],

            provideCompletionItems: function (model, position) {
                const textUntilPosition = model.getValueInRange({
                    startLineNumber: position.lineNumber,
                    startColumn: 1,
                    endLineNumber: position.lineNumber,
                    endColumn: position.column
                });

                const wordInfo = model.getWordUntilPosition(position);
                const range = {
                    startLineNumber: position.lineNumber,
                    endLineNumber: position.lineNumber,
                    startColumn: wordInfo.startColumn,
                    endColumn: wordInfo.endColumn
                };

                const suggestions = [];

                // --- CHECK FOR DOT TRIGGER OR PROPERTY ACCESS (e.g. os., math.sq, np.ar) ---
                let objectChain = null;
                const fullLine = model.getLineContent(position.lineNumber);
                const beforeWord = fullLine.substring(0, wordInfo.startColumn - 1);

                if (textUntilPosition.endsWith('.')) {
                    const m = textUntilPosition.slice(0, -1).match(/([a-zA-Z0-9_.]+)$/);
                    if (m) objectChain = m[1];
                } else if (beforeWord.endsWith('.')) {
                    const m = beforeWord.slice(0, -1).match(/([a-zA-Z0-9_.]+)$/);
                    if (m) objectChain = m[1];
                }

                if (objectChain) {
                    // Check if objectChain is an alias defined in the file (e.g. import math as m)
                    const code = model.getValue();
                    let targetModule = objectChain;
                    const aliasRegex = new RegExp(`(?:import\\s+([a-zA-Z0-9_.]+)\\s+as\\s+${objectChain}|from\\s+([a-zA-Z0-9_.]+)\\s+import\\s+([a-zA-Z0-9_]+)\\s+as\\s+${objectChain})`);
                    const aliasMatch = code.match(aliasRegex);
                    if (aliasMatch) {
                        targetModule = aliasMatch[1] || (aliasMatch[2] + '.' + aliasMatch[3]);
                    }

                    const members = MODULE_MEMBERS[targetModule] || MODULE_MEMBERS[objectChain];

                    if (members && members.length > 0) {
                        members.forEach(m => {
                            let kind = monaco.languages.CompletionItemKind.Method;
                            if (m.kind === 'Field') kind = monaco.languages.CompletionItemKind.Field;
                            else if (m.kind === 'Class') kind = monaco.languages.CompletionItemKind.Class;
                            else if (m.kind === 'Module') kind = monaco.languages.CompletionItemKind.Module;

                            suggestions.push({
                                label: m.name,
                                kind: kind,
                                detail: `${objectChain}.${m.name}${m.sig || ''}`,
                                documentation: {
                                    value: `**${targetModule}.${m.name}${m.sig || ''}**\n\n${m.doc || ''}`
                                },
                                insertText: m.snippet || m.name,
                                insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                                range: range,
                                sortText: '0' + m.name
                            });
                        });
                        return { suggestions };
                    }
                }

                // --- CHECK IF AFTER "import " OR "from ... import " ---
                const importMatch = textUntilPosition.match(/(?:from\s+([a-zA-Z0-9_.]+)\s+import\s+([a-zA-Z0-9_,\s]*)|import\s+([a-zA-Z0-9_,\s]*))$/);
                if (importMatch) {
                    // If "from <mod> import ..." suggest members of <mod>
                    if (importMatch[1]) {
                        const modName = importMatch[1];
                        const members = MODULE_MEMBERS[modName];
                        if (members) {
                            members.forEach(m => {
                                suggestions.push({
                                    label: m.name,
                                    kind: monaco.languages.CompletionItemKind.Function,
                                    detail: `${modName}.${m.name}`,
                                    documentation: m.doc,
                                    insertText: m.name,
                                    range: range
                                });
                            });
                            return { suggestions };
                        }
                    }

                    // Otherwise suggest modules
                    PYTHON_MODULES.forEach(mod => {
                        suggestions.push({
                            label: mod.name,
                            kind: monaco.languages.CompletionItemKind.Module,
                            detail: `Python Module: ${mod.name}`,
                            documentation: mod.desc,
                            insertText: mod.name,
                            range: range,
                            sortText: '0' + mod.name
                        });
                    });
                    return { suggestions };
                }

                // --- 1. PYTHON MODULES ---
                PYTHON_MODULES.forEach(mod => {
                    suggestions.push({
                        label: mod.name,
                        kind: monaco.languages.CompletionItemKind.Module,
                        detail: `Module: ${mod.name}`,
                        documentation: {
                            value: `**${mod.name}**\n\n${mod.desc}\n\n*Python Standard/Popular Library*`
                        },
                        insertText: mod.name,
                        range: range,
                        sortText: '3' + mod.name
                    });
                });

                // --- 2. PYTHON BUILT-IN FUNCTIONS ---
                PYTHON_BUILTINS.forEach(b => {
                    suggestions.push({
                        label: b.name,
                        kind: monaco.languages.CompletionItemKind.Function,
                        detail: `built-in function ${b.name}${b.sig}`,
                        documentation: {
                            value: `\`\`\`python\n${b.name}${b.sig}\n\`\`\`\n\n${b.doc}`
                        },
                        insertText: b.snippet,
                        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                        range: range,
                        sortText: '1' + b.name
                    });
                });

                // --- 3. PYTHON SNIPPETS ---
                PYTHON_SNIPPETS.forEach(s => {
                    suggestions.push({
                        label: s.label,
                        kind: monaco.languages.CompletionItemKind.Snippet,
                        detail: s.detail,
                        documentation: {
                            value: `**${s.detail}**\n\n${s.doc}\n\n\`\`\`python\n${s.snippet.replace(/\$\{\d+:?([^}]*)\}/g, '$1')}\n\`\`\``
                        },
                        insertText: s.snippet,
                        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                        range: range,
                        sortText: '2' + s.label
                    });
                });

                // --- 4. DYNAMIC WORKSPACE SYMBOLS (FUNCTIONS, CLASSES, VARIABLES) ---
                try {
                    let filesContent = [model.getValue()];
                    if (typeof getWorkspaceFiles === 'function') {
                        const extraFiles = getWorkspaceFiles();
                        if (Array.isArray(extraFiles)) {
                            filesContent = filesContent.concat(extraFiles);
                        }
                    }

                    const symbols = extractWorkspaceSymbols(filesContent);

                    // User functions
                    symbols.functions.forEach(f => {
                        suggestions.push({
                            label: f.name,
                            kind: monaco.languages.CompletionItemKind.Function,
                            detail: `workspace function: ${f.name}${f.sig}`,
                            documentation: `Function defined in workspace: \`${f.name}${f.sig}\``,
                            insertText: f.snippet,
                            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                            range: range,
                            sortText: '0' + f.name
                        });
                    });

                    // User classes
                    symbols.classes.forEach(c => {
                        suggestions.push({
                            label: c.name,
                            kind: monaco.languages.CompletionItemKind.Class,
                            detail: `workspace class: ${c.name}${c.base ? `(${c.base})` : ''}`,
                            documentation: `Class defined in workspace: \`${c.name}\``,
                            insertText: c.snippet,
                            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                            range: range,
                            sortText: '0' + c.name
                        });
                    });

                    // User variables
                    symbols.variables.forEach(v => {
                        suggestions.push({
                            label: v,
                            kind: monaco.languages.CompletionItemKind.Variable,
                            detail: `workspace variable: ${v}`,
                            insertText: v,
                            range: range,
                            sortText: '1' + v
                        });
                    });
                } catch (e) {
                    console.warn('Workspace symbol extraction warning:', e);
                }

                return { suggestions };
            }
        });

        // Hover Provider for Python
        monaco.languages.registerHoverProvider('python', {
            provideHover: function (model, position) {
                const word = model.getWordAtPosition(position);
                if (!word) return null;

                const name = word.word;

                // Built-in function hover
                const builtin = PYTHON_BUILTINS.find(b => b.name === name);
                if (builtin) {
                    return {
                        range: new monaco.Range(position.lineNumber, word.startColumn, position.lineNumber, word.endColumn),
                        contents: [
                            { value: `**built-in function** \`${builtin.name}${builtin.sig}\`` },
                            { value: builtin.doc }
                        ]
                    };
                }

                // Module hover
                const mod = PYTHON_MODULES.find(m => m.name === name);
                if (mod) {
                    return {
                        range: new monaco.Range(position.lineNumber, word.startColumn, position.lineNumber, word.endColumn),
                        contents: [
                            { value: `**Python Module** \`${mod.name}\`` },
                            { value: mod.desc }
                        ]
                    };
                }

                // Check line for dot completion hover (e.g., os.path.join)
                const lineContent = model.getLineContent(position.lineNumber);
                const prefix = lineContent.substring(0, word.startColumn - 1);
                const dotMatch = prefix.match(/([a-zA-Z0-9_.]+)\.$/);
                if (dotMatch) {
                    const parent = dotMatch[1];
                    const members = MODULE_MEMBERS[parent];
                    if (members) {
                        const m = members.find(item => item.name === name);
                        if (m) {
                            return {
                                range: new monaco.Range(position.lineNumber, word.startColumn, position.lineNumber, word.endColumn),
                                contents: [
                                    { value: `**${parent}.${m.name}**\`${m.sig || ''}\`` },
                                    { value: m.doc || '' }
                                ]
                            };
                        }
                    }
                }

                return null;
            }
        });

        console.log('Python IntelliSense engine registered successfully.');
    }

    // Expose globally
    window.PythonIntellisense = {
        register: registerPythonIntellisense,
        PYTHON_MODULES: PYTHON_MODULES,
        PYTHON_BUILTINS: PYTHON_BUILTINS,
        MODULE_MEMBERS: MODULE_MEMBERS
    };

})(window);
