import numpy as np
import matplotlib.pyplot as plt
import sys
if len( sys.argv ) > 0:
	p=float(sys.argv[1])
	N=int(sys.argv[2])
U=np.random.random(N)

X=[0]
"""
for i in range(N):
	if U[i]>p:
		X.append((X[i]+1)*(1-X[i]))
	else:
		X.append(X[i])
t=np.linspace(0,N,N+1)
plt.plot(t,X,'ro')
plt.show()
	"""


x_pts = [0]
y_pts = [0]

fig, ax = plt.subplots()
plt.xlim(-0.5,N)
plt.ylim(-0.5,1.5)
line, = ax.plot(x_pts, y_pts, "ro")

def onpick(event):
    m_x, m_y = event.x, event.y
    if np.random.random()>p:
	    y_pts.append((y_pts[-1]+1)*(1-y_pts[-1]))
    else:
	    y_pts.append(y_pts[-1])
    x_pts.append(x_pts[-1]+1)
    line.set_xdata(x_pts)
    line.set_ydata(y_pts)
    fig.canvas.draw()

fig.canvas.mpl_connect('key_press_event', onpick)

plt.show()
