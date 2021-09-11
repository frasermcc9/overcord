# State
Overcord allows for a second type of injected argument in regular (non-slash)
commands - a state. State is persisted between command usages (but is still kept
in memory, not permanently persisted).

## Example

```ts
class PersistentCommand extends Command {
    @Stateful<string[]>({
        domain: "GUILD",
        initialState: [],
        onUpdate: (newState) => {
            Database.updateNameList(newState)
        },
    })
    private nameList!: State<string[]>;

    ...

    execute() {
      const [getNameList, setNameList] = this.nameList;
      const myNameList = getNameList();
      setNameList([...myNameList, "John"]);
    }
}

```

### Explanation

The above example will create a state that is persisted between command usages.
The `domain` property allows you to specify the granularity of the state, i.e.
if the state should be shared between USERS, GUILDS, or GLOBALLY.

You can destructure the state array to get the option to read and write to the
state. You should not modify the state directly, but instead use the second
argument to set the state. Modifications will persist, but will not fire the
onUpdate callback.

The onUpdate callback runs whenever the state is set via the second element of
the state array. This callback could be useful for updating a database for a
more permanent storage.