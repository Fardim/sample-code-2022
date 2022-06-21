# How to use ngrx-store

### State

State is simply the current state of the ngrx-store. The store is the central data repository and all components should be referring to this store to render or display their component as appropriate. The state is immutable, this means that you should NEVER modify the state, all states must be returned as a complete new object via updated by the Reducer - see below.

### Selectors

Selectors are simple defined methods to select certain parts of the store and is designed to be reusuable.

### Actions

ACTION are like events that you wish to trigger which in most circumstances will change the state of the store. So if you a data row was updated, the user saves some piece of information an ACTION will be triggered. As far as the component is concerned, it only needs to trigger the action and pass the correct parameters. It should not care about registering a response to that action because once an ACTION is dispatched, its job is done.

Any component or function that is listening should be subscribing to the appropriate part of the store. So for example, a record update ACTION is called, that record then execute the update record the response is successful. The new values are now updated in the store via a reducer and ANY component that is subscribing to that part of the store will now get the updated information.

An ACTION will also consume a service

### Reducers

REDUCERS are only responsible for making changes to the store. Based on the ACTION, the REDUCER will make the appropriate change to the right place in the store. Only reducers have access to make changes to the store and changes must be immutable. i.e. changes should not be making any references to an object, rather a new object is instantiated using `object.assign` function.

### Effects

This capability is probably the most confusing and difficult part of the store. The idea of using effects is to listen to Actions and then based on certain Actions, do something else. For example, if you are triggering a `Save` record action, then you may want to update other parts of the store based on the success/failure of the save action. This is where effects come into play. Essentially think of effects as a `Side Effect` or chaining of events based on an Action. Another way to think about it is you after you make a http request, based on the success/failure or even message of the response you want to trigger another Action that changes the another part of the store.

Using effects correctly will greatly reduce the amount of responsibility of the component especially if data is coming from mulitple sources.
