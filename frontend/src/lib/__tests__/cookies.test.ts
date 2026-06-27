// @vitest-environment jsdom

import { describe, it, expect, beforeEach } from 'vitest';
import { setCookie, getCookie, deleteCookie } from '../cookies';

describe('Cookies Utility', () => {
  beforeEach(() => {
    const cookies = document.cookie.split(";");
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i];
      const eqPos = cookie.indexOf("=");
      const name = eqPos > -1 ? cookie.substring(0, eqPos) : cookie;
      if (name.trim()) {
        document.cookie = name.trim() + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
      }
    }
  });

  it('should set cookies with path and expires format', () => {
    setCookie('testCookie', 'testValue', 1);
    expect(document.cookie).toContain('testCookie=testValue');
  });

  it('should return null for non-existent cookies', () => {
    expect(getCookie('missingCookie')).toBeNull();
  });

  it('should retrieve correct values for existing cookies', () => {
    document.cookie = 'foo=bar;path=/';
    document.cookie = 'hello=world;path=/';
    expect(getCookie('foo')).toBe('bar');
    expect(getCookie('hello')).toBe('world');
  });

  it('should clear cookie values on deleteCookie', () => {
    document.cookie = 'foo=bar;path=/';
    expect(getCookie('foo')).toBe('bar');
    deleteCookie('foo');
    expect(getCookie('foo')).toBeNull();
  });
});
