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
# PyVista Visualization
# -------------------------

from sklearn.cluster import DBSCAN

# Split points
normal_points = points_before[~damage]
damage_points = points_before[damage]

plotter = pv.Plotter(window_size=(1400, 900))
plotter.set_background("black")

# Normal object
plotter.add_points(
    normal_points,
    color="lightgray",
    point_size=3,
    render_points_as_spheres=True,
)

# Damage
plotter.add_points(
    damage_points,
    color="red",
    point_size=10,
    render_points_as_spheres=True,
)

# ------------------------------------
# Cluster damaged points
# ------------------------------------

if len(damage_points) > 0:

    clustering = DBSCAN(eps=0.01, min_samples=10).fit(damage_points)

    labels = clustering.labels_

    unique_labels = np.unique(labels)

    cluster_no = 1

    for label in unique_labels:

        if label == -1:
            continue

        cluster = damage_points[labels == label]

        # Bounding Box
        xmin, ymin, zmin = cluster.min(axis=0)
        xmax, ymax, zmax = cluster.max(axis=0)

        box = pv.Box(bounds=(xmin, xmax, ymin, ymax, zmin, zmax))

        plotter.add_mesh(box, style="wireframe", color="red", line_width=5)

        # Center
        center = cluster.mean(axis=0)

        plotter.add_point_labels(
            [center],
            [f"Damage {cluster_no}\n{len(cluster)} pts"],
            font_size=16,
            text_color="white",
            point_color="red",
            point_size=20,
            shape=None,
        )

        cluster_no += 1

# ------------------------------------
# Text
# ------------------------------------

plotter.add_text(
    f"""
Total Points : {len(points_before)}
Damaged      : {damage.sum()}
Damage       : {100*damage.mean():.2f} %
Clusters     : {cluster_no-1 if len(damage_points)>0 else 0}
""",
    position="upper_left",
    font_size=14,
    color="white",
)

plotter.add_legend(
    [
        ["Normal", "lightgray"],
        ["Damage", "red"],
    ],
    bcolor="black",
)

plotter.show()
