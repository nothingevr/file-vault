import numpy as np
import open3d as o3d
import pandas as pd
import pyvista as pv

# -------------------------
# Load CSVs
# -------------------------

before = pd.read_csv("vertices.csv")
after = pd.read_csv("after.csv")

pts_before = before[["x", "y", "z"]].to_numpy(dtype=np.float64)
pts_after = after[["x", "y", "z"]].to_numpy(dtype=np.float64)

# -------------------------
# Create Point Clouds
# -------------------------

pcd_before = o3d.geometry.PointCloud()
pcd_after = o3d.geometry.PointCloud()

pcd_before.points = o3d.utility.Vector3dVector(pts_before)
pcd_after.points = o3d.utility.Vector3dVector(pts_after)

# -------------------------
# Remove duplicates
# -------------------------

pcd_before.remove_duplicated_points()
pcd_after.remove_duplicated_points()

# -------------------------
# ICP Alignment
# -------------------------

reg = o3d.pipelines.registration.registration_icp(
    pcd_after,
    pcd_before,
    0.05,
    np.eye(4),
    o3d.pipelines.registration.TransformationEstimationPointToPoint(),
)

pcd_after.transform(reg.transformation)

print(reg)

# -------------------------
# KDTree
# -------------------------

tree = o3d.geometry.KDTreeFlann(pcd_after)

points_before = np.asarray(pcd_before.points)

distances = np.zeros(len(points_before))

for i, p in enumerate(points_before):

    _, idx, d2 = tree.search_knn_vector_3d(p, 1)

    distances[i] = np.sqrt(d2[0])

# -------------------------
# Statistics
# -------------------------

tol = 0.001

damage = distances > tol

print()

print("Total Points :", len(points_before))
print("Damaged :", damage.sum())
print("Percent :", 100 * damage.mean())

# -------------------------
# PyVista
# -------------------------

cloud = pv.PolyData(points_before)

cloud["damage"] = distances

plotter = pv.Plotter()

plotter.set_background("black")

plotter.add_points(
    cloud,
    scalars="damage",
    cmap="turbo",
    point_size=5,
    render_points_as_spheres=True,
)

plotter.add_scalar_bar(title="Distance")

plotter.show()
