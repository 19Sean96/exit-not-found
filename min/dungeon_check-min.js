const checker=(e,[r,i],[t,f],[l,n],[u,c],s,x,[o,k],y=0)=>{if(++y>400)return;ctx.fillStyle=e[t][f]&&"darkturquoise",ctx.fillRect(t,f,x,x),ctx.fillStyle=e[r][i]&&"darkblue",ctx.fillRect(r,i,x,x),ctx.fillStyle=e[c]&&"goldenrod",ctx.fillRect(u,c,x,x),ctx.fillStyle=e[n]&&"hotpink",ctx.fillRect(l,n,x,x);const a=e[r]?.[i-x],d=e[r+x]?.[i],h=e[r-x]?.[i],R=e[r]?.[i+x],S=i==f,g=r==t,b=r==t+x,m=r==t-x,p=i==f+x,q=i==f-x,w=(t,f,a=s,d=r,h=i)=>setTimeout(()=>checker(e,[t,f],[d,h],[l,n],[u,c],a,x,[o,k],y++),1);if(l==r&&n==i)return generatePlayer([u,c],"white",e,x,[l,n]),!0;if(a||d||h||R)if(s)if(1!=s)if(2!=s)if(3!=s);else{if(r-x<0)return p&&d?w(r+x,i):i==k?w(r,i,0):R?w(r,i+x):w(r,i,0);if(g&&S)return h?w(r-x,i):w(r,i-x);if(g){if(q)return h?w(r-x,i):a?w(r,i-x):d?w(r+x,i):w(r,i+x);if(p)return 0==r?R?w(r,i+x):d?w(r+x,i):w(r,i+x):d?w(r+x,i):R?w(r,i+x):h?w(r-x,i):w(r,i-x)}else if(S){if(m)return 0==r?R?w(r,i+x):d?w(r-x,i):w(r,i-x):R?w(r,i+x):h?w(r-x,i):a?w(r,i-x):w(r+x,i);if(b)return a?w(r,i-x):d?w(r+x,i):R?w(r,i+x):w(r-x,i)}}else{if(i==k)return b&&a?w(r,i-x):r==o?w(r,i,3):d?w(r+x,i):w(r,i,3);if(g&&S)return R?w(r,i+x):w(r-x,i);if(g){if(q)return h?w(r-x,i):a?w(r,i-x):d?w(r+x,i):w(r,i+x);if(p)return r==o?R?w(r,i+x):h?w(r-x,i):w(r,i-x):d?w(r+x,i):R?w(r,i+x):h?w(r-x,i):w(r,i-x)}else if(S){if(m)return R?w(r,i+x):h?w(r-x,i):a?w(r,i-x):w(r+x,i);if(b)return 0==r?a?w(r,i-x):d?w(r+x,i):w(r,i+x):a?w(r,i-x):d?w(r+x,i):R?w(r,i+x):w(r-x,i)}}else{if(r==o)return q&&h?w(r-x,i):0==i?w(r,i,2):a?w(r,i-x):w(r,i,2);if(g&&S)return d?w(r+x,i):w(r,i+x);if(g){if(q)return i==k?w(h?r-x:r+x,i):h?w(r-x,i):a?w(r,i-x):d?w(r+x,i):w(r,i+x);if(p)return d?w(r+x,i):R?w(r,i+x):h?w(r-x,i):w(r,i-x)}else if(S){if(m)return r==o?a?w(r,i-x):w(h?r-x:r+x,i):R?w(r,i+x):h?w(r-x,i):a?w(r,i-x):w(r+x,i);if(b)return a?w(r,i-x):d?w(r+x,i):R?w(r,i+x):w(r-x,i)}}else{if(0==i)return m&&R?w(r,i+x):0==r?w(r,i,1):h?w(r-x,i):w(r,i,1);if(g&&S)return a?w(r,i-x):w(r+x,i);if(g){if(q)return 0==r?a?w(r,i-x):d?w(r+x,i):w(r,i+x):h?w(r-x,i):a?w(r,i-x):d?w(r+x,i):w(r,i+x);if(p)return 0==r?d?w(r+x,i):w(r,R?i+x:i-x):d?w(r+x,i):R?w(r,i+x):h?w(r-x,i):w(r,i-x)}else if(S){if(m)return 0===r?R?w(r,i+x):a?w(r,i-x):w(r+x,i):R?w(r,i+x):h?w(r-x,i):a?w(r,i-x):w(r+x,i);if(b)return a?w(r,i-x):d?w(r+x,i):R?w(r,i+x):w(r-x,i)}}};