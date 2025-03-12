import { render, screen } from '@testing-library/react';
import App from './App';
import { supabase } from './createClient';
import { SignUp } from './Register'

test('renders learn react link', () => {
  render(<App />);
  const linkElement = screen.getByText(/learn react/i);
  expect(linkElement).toBeInTheDocument();
});

// Back-End Tests
  // Database Tests
  const user = {
    username: "manasimehta",
    password: "Qwerty123",
  };
  describe('database', () => {

    //A.1
    test('should add user to the database', async () => {
      //call the SignUp function then wait to see if it has been added to the database
      // there is likely a better way of doing this. 
      await SignUp(user)
      result = await supabase
        .from('Users')
        .select(userName)
        .eq('userName', user.username)
      
      expect(result).toBe(user.username);
    })

    //A.2
    test('Disallow duplicate users', async () => {
      // Last test we tried adding a user, we repeat this to see if it works
      expect(async () => {
        await SignUp(user);
      }).toThrow();
    })

    //A.3
    test('throws when missing password', async () => {
      expect (async () => {
        await SignUp(user.username, "")
      }).toThrow();
    })

    //A.4
    test('throws when missing username', async () => {
      expect (async () => {
        await SignUp("" ,user.password)
      }).toThrow();
    })

    //A.5
    test('throws when password invald', async () => {
      expect (async () => {
        await SignUp("" ,user.password)
      }).toThrow();
    })

    afterWoker(async () => {
      // delete entry we've added for these tests 
      const { error } = await supabase
        .from('Users')
        .delete()
        .eq('userName', user.username)
    })
  })  

// API Tests
//Below are the new tests that I added
describe('API', () => {

  //B.1
  test('should broadcast correct message when valid message is provided', async () => {
    const response = await API.broadcastMessage('hello');
    expect(response).toBeDefined();
  })

  //B.2.a
  test('should not broadcast when message is empty', async () => {
    expect(async () => {
      await API.broadcastMessage('')
    }).toThrow();
  })

  //B.2.b
  test('should not broadcast when message is empty', async () => {
    expect(async () => {
      await API.broadcastMessage('     ')
    }).toThrow();
  })

  //B.2.c
  test('should return error for broadcastMessage with null input', async () => {
    await expect(API.broadcastMessage(null)).rejects.toThrow('Message cannot be null');
  });

  //B.3
  test('should handle broadcastMessage with very long message', async () => {
    const longMessage = 'a'.repeat(1000); // Assuming 1000 chars is too long
    await expect(API.broadcastMessage(longMessage)).rejects.toThrow('Message is too long');
  });

  //B.4
  test('should trim message before broadcasting', async () => {
    const response = await API.broadcastMessage('   hello   ');
    expect(response).toBeDefined();
    expect(response.message).toBe('hello');
  });

  //B.5
  test('should not broadcast message containing banned words', async () => {
    const bannedWords = 'This message contains a bannedWord';
    await expect(API.broadcastMessage(bannedWords)).rejects.toThrow('Message contains banned words');
  });
})

