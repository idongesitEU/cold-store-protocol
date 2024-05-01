# k-store-protocol
Generate pseudo random passwords from a given `base phrase`, you can also include and `extended base` 

#### Base 
The base phrase used to derive passwords
#### Extended base
Added to the base to give extra entropy
#### Pseudo Random Integer
Derived by hashing a given input in `sha256` and converting the result to base 10
#### Checksum Word
Derived by using the base key to calculate a `pseudo random integer` then scale the integer to a number between 0 and 1 by dividing it by the hexadeciamal `ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff` (`f` in 64 places) and scalling the result to the length of the word list used to pick a pseudo random word. The checksum word is placed in front of the `base`, seperated by a space.

The `extended base` is placed after the  checksum word if any exist. This is then hashed to derive a `base key hash`. The `base key hash` is used to authenticate if the `base` and the `extended base` are the same as entered durring the initial set up the perevent the user from entering a wrong `base` or `extended base`.
#### Site Pseudo Random Integer
a `pseudo random integer` with an input of <mark>{{`base key`}} {{`site name`}}`</mark>

### Password Format
The password in its raw form is: <mark>{{`base key`}} {{`site pseudo random integer`}}</mark>  
This is then hashed successively for 10**7 times both in hex and base64.  
The output hash is then added togerther in the form <mark>{{`hex hash`}}{{`base 64 hash`}}</mark>  
**Note that the `base 64 hash` is converted to `hex` before joining`**.  
The output is converted to 512 bit binary, which is then split into segments of 32 bits each. each 32 bit is converted to decimal and used to perform modular division to select form the default ASCII character set of 94 items.
