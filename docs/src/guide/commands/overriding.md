# Built-in Command Methods

- [Built-in Command Methods](#built-in-command-methods)
  - [Non-Overrideable Methods](#non-overrideable-methods)
    - [awaitReply](#awaitreply)
    - [say](#say)
    - [codifySay](#codifysay)
    - [printArrayChunks](#printarraychunks)
  - [Overrideable Methods](#overrideable-methods)
    - [execute](#execute)
    - [log](#log)
    - [error](#error)
    - [commandDidExecute](#commanddidexecute)
    - [commandShouldExecute](#commandshouldexecute)
    - [commandDidNotExecute](#commanddidnotexecute)
    - [commandWillShowHelp](#commandwillshowhelp)
    - [commandDidInhibit](#commanddidinhibit)
    - [commandDidBlock](#commanddidblock)

The command class has a number of built-in helper methods to help reduce boilerplate code for common patterns. These come into two categories:
 - Overrideable 
 - Non-overrideable

The non-overrideable methods are helper methods to help with commonly used commands. The overrideable methods are often hooks that are called at different parts of the commands execution flow.

## Non-Overrideable Methods

### awaitReply
Asynchronously wait for the command invoker to reply, and return their message.

### say
A shortcut to send a message to the channel the command was invoked in. Also directly supports MessageEmbeds.

### codifySay
A shortcut to send a message in code-markdown format.

### printArrayChunks
A method to send an array in a channel. It will also split the array into multiple messages, if the character limit is exceeded.

## Overrideable Methods

### execute
This is abstract, so must be overridden. This is what gets executed if your command is allowed to!

### log
Logs a successful execution.

### error
Standard error handler. You should call this when theres an error in your command. Throwing will also move execution to this method.

### commandDidExecute
Called after the command executes.

### commandShouldExecute
Called when the command is likely going to execute. Override this if you want to do some custom checks to see if the command should run or not.

### commandDidNotExecute
Called when commandShouldExecute fails.

### commandWillShowHelp
Called when an error occurs with the arguments provided by the user for the comand.

### commandDidInhibit
Called when the inhibitor blocks command execution.

### commandDidBlock
Called when the permission manager blocks command execution.

