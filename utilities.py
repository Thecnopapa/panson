import shutil
import time
import os


def tprint(*strings, head=10, style="#", end="\n", sep=" "):  # Print section title
    width = shutil.get_terminal_size()[0] -2
    string = " ".join(strings)
    tail = width - head - len(string)
    print("\n{}{}{}{}{}".format(style*head, sep, string, sep, style*tail), end=end)



def eprint(*strings, head=10, style = "^", sep=" "):  # Print end of section
    tprint(*strings, head=head, style=style, end="\n\n", sep=sep)

def sprint(*strings,**kwargs): # Print Subtitle
    str_strings = map(str, strings)
    print("\n #", " ".join(str_strings),**kwargs)

def print1(*strings, space=2, **kwargs): # Print with 1 indent
    str_strings = []
    for string in strings:
        if type(string) == list or type(string) == tuple:
            for string2 in string:
                str_strings.append(str(string2))
        else:
            str_strings.append(str(string))
    #str_strings = map(str, strings)

    print("{}> {}".format(" " * space, " ".join(str_strings)), **kwargs)

def print2(*strings, **kwargs): # Print with 2 indents
    print1(strings, space=4, **kwargs)

def print3(*strings, **kwargs):
    print1(strings, space=6, **kwargs)

def print4(*strings, **kwargs):
    print1(strings, space=8, **kwargs)

def print5(*strings, **kwargs):
    print1(strings, space=10, **kwargs)

def print6(*strings, **kwargs):
    print1(strings, space=12, **kwargs)

def clean_string(string, allow=(".", "_")):
    from unidecode import unidecode
    return ''.join(e for e in unidecode(str(string)) if e.isalnum() or e in allow)

def get_digits(string, allow=("."), integer = False):
    from unidecode import unidecode
    try:
        if integer:
            return int(''.join(e for e in unidecode(str(string)) if e.isdigit() or e in allow))
        else:
            return float(''.join(e for e in unidecode(str(string)) if e.isdigit() or e in allow))
    except:
        try:
            from Globals import vars
            if vars.verbose:
                print("No digits found in: {}".format(string))
                print(''.join(e for e in unidecode(str(string)) if e.isdigit() or e in allow))
        except:
            print("No digits found in: {}".format(string))
            print(''.join(e for e in unidecode(str(string)) if e.isdigit() or e in allow))

        return None

def add_front_0(string, digits=2, zero = "0"):
    ret = ""
    string = str(string)
    for i in range(digits-len(string)):
        ret += zero
    ret += string
    return ret


def supress(fun, *args, **kwargs):
    try:
        return fun(*args, **kwargs)
    except:
        return None

def print_dict(dict):
    for k, v in dict.items():
        print("{}: {}".format(k, v))


class ProgressBar:
    def __init__(self, total=100, style="=", start=0, silent = False, title=True):
        self.start_time = time.perf_counter()
        self.total = total
        self.start = start
        self.current = start
        self.silent = silent
        self.title = title
        try:
            self.width = shutil.get_terminal_size()[0]-2
        except:
            self.width = 19
        self.style = style

    def add(self, info = "", increment=1, show_time = False):
        self.current += increment
        if self.current == self.total:
            self.finish()
        else:
            if show_time:
                info = info + "|{}s".format(round(time.perf_counter() - self.start_time))
            self.update(info=info)

    def restart(self,total=None):
        self.current = self.start
        if total is not None:
            self.total = total

    def finish(self):
        self.update(end="\n")
        if not self.silent:
            ring_bell(times=2)
        print("Completed in {} seconds".format(round(time.perf_counter() - self.start_time, 2)))


    def update(self, end="\r", info = ""):
        progress = int(self.current * 100 // self.total)

        if len(info) > 0:
            info+= " "
        percentage = "|{}|{}%".format(info,add_front_0(progress, digits=3, zero = " "))
        bar_width = self.width - len(percentage)
        progress_scaled = int(progress * bar_width //100)
        bar = "|{}>".format(self.style * progress_scaled)
        blank = " " * (self.width - len(bar)- len(percentage))
        print("{}{}{}".format(bar, blank, percentage), end = end)
        if self.title:
            try:
                from Globals import vars
                print('\33]0;{}\a'.format(os.path.basename(vars.tab_name + " {}%". format(progress))), end='', flush=True)
            except:
                pass




def clean_list(strings:list, delimiter=" ", format="float", allow=["."]):
    cleaned = []
    for string in strings:
        list = string.split(delimiter)
        # print(list)
        for e in list:
            # print("e:", e)
            c = clean_string(e, allow=allow)
            # print("clean:",c)
            if c != "":
                if format == "integer":
                    c = int(c)
                elif format == "float":
                    c = float(c)
                elif format == "bool":
                    if c == "False":
                        c = False
                    elif c == "True":
                        c = True
                elif format == "string":
                    if c == "None":
                        c = None
                    else:
                        c = str(c)
                cleaned.append(c)
    return cleaned



def sort_dict(x, as_list = False, ascendant = False):
    if x is None:
        return None
    if as_list:
        return [(k, v) for k, v in sorted(x.items(), key=lambda item: item[1], reverse = not ascendant)]
    else:
        return {k: v for k, v in sorted(x.items(), key=lambda item: item[1], reverse=not ascendant)}


def string_to_dict(string, allow=["-", "_"]):
    keys= []
    values = []
    items = string.split(",")
    keys.extend([clean_string(item.split(":")[0],allow=allow) for item in items])
    values.extend([clean_string(item.split(":")[1],allow=allow) for item in items])
    new_dict = dict(zip(keys, values))
    [print("key:", key, "value:",value) for key, value in new_dict.items()]
    return new_dict
