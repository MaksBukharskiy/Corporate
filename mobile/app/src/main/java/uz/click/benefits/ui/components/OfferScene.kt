package uz.click.benefits.ui.components

import androidx.annotation.DrawableRes
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.BoxScope
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.alpha
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.res.painterResource
import uz.click.benefits.R
import uz.click.benefits.data.Category
import uz.click.benefits.data.Offer

private val allScenes = listOf(
    R.drawable.scene_gym,
    R.drawable.scene_yoga,
    R.drawable.scene_food,
    R.drawable.scene_education,
    R.drawable.scene_health,
    R.drawable.scene_parking,
    R.drawable.scene_shuttle,
    R.drawable.scene_fest,
    R.drawable.scene_lake,
)

fun scenesFor(category: Category) = when (category) {
    Category.sport -> listOf(R.drawable.scene_gym, R.drawable.scene_yoga)
    Category.food -> listOf(R.drawable.scene_food, R.drawable.scene_education)
    Category.education -> listOf(R.drawable.scene_education, R.drawable.scene_gym)
    Category.health -> listOf(R.drawable.scene_health, R.drawable.scene_yoga)
    Category.transport -> listOf(R.drawable.scene_parking, R.drawable.scene_shuttle)
    Category.events -> listOf(R.drawable.scene_fest, R.drawable.scene_lake)
}

@DrawableRes
fun sceneRes(offer: Offer): Int {
    val key = "${offer.subsection} ${offer.title} ${offer.description}".lowercase()
    return when {
        "йог" in key -> R.drawable.scene_yoga
        "парков" in key -> R.drawable.scene_parking
        "трансфер" in key || "шаттл" in key -> R.drawable.scene_shuttle
        "fest" in key || "фестив" in key -> R.drawable.scene_fest
        "озер" in key || "тимбилд" in key || "чарвак" in key -> R.drawable.scene_lake
        else -> sceneRes(offer.category)
    }
}

@DrawableRes
fun sceneRes(category: Category): Int = scenesFor(category).first()

@DrawableRes
fun heroRes(offer: Offer): Int = otherScene(sceneRes(offer), offer.category)

@DrawableRes
fun heroRes(category: Category): Int = otherScene(sceneRes(category), category)

@DrawableRes
private fun otherScene(@DrawableRes avoid: Int, category: Category): Int {
    val pool = scenesFor(category) + allScenes
    return pool.first { it != avoid }
}

fun sceneScrim(
    top: Float = 0.32f,
    mid: Float = 0.48f,
    bottom: Float = 0.82f,
) = Brush.verticalGradient(
    0f to Color.Black.copy(alpha = top),
    0.45f to Color.Black.copy(alpha = mid),
    1f to Color.Black.copy(alpha = bottom),
)

@Composable
fun SceneBackdrop(
    @DrawableRes resId: Int,
    modifier: Modifier = Modifier,
    overlay: Brush = sceneScrim(),
    imageAlpha: Float = 0.72f,
    content: @Composable BoxScope.() -> Unit = {},
) {
    Box(modifier.background(Color.Black)) {
        Image(
            painter = painterResource(resId),
            contentDescription = null,
            contentScale = ContentScale.Crop,
            modifier = Modifier.fillMaxSize().alpha(imageAlpha),
        )
        Box(Modifier.fillMaxSize().background(overlay))
        content()
    }
}
