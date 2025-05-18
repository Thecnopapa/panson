import shutil
import time
import os

try:
    from Globals import vars
    globals_loaded = True
except:
    globals_loaded = False

def tprint(*strings, head=10, style="#", end="\n", sep=" "):  # Print section title
    width = shutil.get_terminal_size()[0] -2
    string = " ".join(strings)
    tail = width - head - len(string)
    print("\n{}{}{}{}{}".format(style*head, sep, string, sep, style*tail), end=end)



def eprint(*strings, head=10, style = "^", sep=" "):  # Print end of section
    tprint(*strings, head=head, style=style, end="\n\n", sep=sep)

def sprint(*strings,**kwargs): # Print Subtitle
    str_strings = map(str, strings)
    if globals_loaded and "quiet" in vars:
        if vars.quiet:
            return
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
    if globals_loaded and "quiet" in vars:
        if vars.quiet:
            return
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
def unpickle(path):
    import pickle
    with open(path, "rb") as f:
        return pickle.load(f)


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

def ring_bell(times = 1, interval=0.2):
    try:
        from Globals import vars
        if vars.quiet:
            return
    except:
        pass
    import sys
    import time
    for i in range(times):
        sys.stdout.write('\a')
        sys.stdout.flush()
        time.sleep(interval)





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



class ThinkingBar(ProgressBar):
    def __init__(self, style="=", length = 10):
        super().__init__(style=style)
        self.tick = 0
        self.length = length

    def update(self, end="\r", info = ""):
        self.current = 0
        start = self.tick
        percentage = "|{}".format(info)
        blank1 = "|" + " "*start
        bar = "{}>".format(self.style * self.length)
        leftover = self.width - len(blank1) - len(bar)- len(percentage)
        if leftover >= 0:
            blank2 =  " "* leftover
            print("{}{}{}{}".format(blank1, bar, blank2, percentage), end=end)
        else:
            bar1 = "|" + bar[leftover:]
            bar2 = bar[:leftover]
            blank = " "*(self.width - len(bar1) - len(bar2)- len(percentage))
            print("{}{}{}{}".format(bar1, blank, bar2, percentage), end=end)
        self.tick += 1
        if leftover < -self.length:
            self.tick = 0


#### In development ###
def start_blinking():
    global blinking_thread
    #from threading import Th
    #blinking_thread = Thread

class BlinkingBar(ThinkingBar):
    from threading import Thread
    thread = None
    def __init__(self,side="right", style="o", length = 10):

        super().__init__(style=style, length=length)
        self.side = side
        self.direction = "right"
        self.length += len(style)

    def update(self, end="\r", info = ""):

        if self.direction == "right":
            self.tick += 1
        else:
            self.tick -= 1
        if self.tick <= 0:
            self.direction = "right"
        if self.tick >= self.length:
            self.direction = "left"
### In development ###

def enable_garbage_collector():
    import gc
    gc.enable()

def collect_garbage():
    import gc
    before = len(gc.get_objects())
    gc.collect()
    after = len(gc.get_objects())
    print("Collected {} objects".format(after - before))

def sort_dict(x, as_list = False, ascendant = False):
    if x is None:
        return None
    if as_list:
        return [(k, v) for k, v in sorted(x.items(), key=lambda item: item[1], reverse = not ascendant)]
    else:
        return {k: v for k, v in sorted(x.items(), key=lambda item: item[1], reverse=not ascendant)}

def KeepInterpreter():
    class HaltException(Exception): pass
    try:
        # script goes here

        # when you want to stop,
        raise HaltException("Somebody stop me!")

    except HaltException as h:
        print(h)
        # now what?

def string_to_dict(string, allow=["-", "_"]):
    keys= []
    values = []
    items = string.split(",")
    keys.extend([clean_string(item.split(":")[0],allow=allow) for item in items])
    values.extend([clean_string(item.split(":")[1],allow=allow) for item in items])
    new_dict = dict(zip(keys, values))
    [print("key:", key, "value:",value) for key, value in new_dict.items()]
    return new_dict
