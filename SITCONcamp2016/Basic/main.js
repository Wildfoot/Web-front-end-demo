var cat = {
          /* key: value */
          name: 'pusheeeen',
          lives: 9,
          /* key 用引號包起來也是可以的，用在有特殊字元的情況下 */
          'self-description': 'meow!',
          web: 'http://www.pusheeeen.com/'
        };

        for (var prop in cat) {
            console.log(prop,     cat[prop]);
            //         ^^^^ key  ^^^^^^^^^ value
        }

/*
var array = [1, 1, 2, 3, 5, 8, 13];
for(var i = 0;i < array.length; i++)
{
    console.log(array[i]);
}
*/


