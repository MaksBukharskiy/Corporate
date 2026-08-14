package uz.click.benefits.ui.components

import androidx.annotation.DrawableRes
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.BoxScope
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.res.painterResource
import uz.click.benefits.R
import uz.click.benefits.data.Category
import uz.click.benefits.data.Offer

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
fun sceneRes(category: Category): Int = when (category) {
    Category.sport -> R.drawable.scene_gym
    Category.food -> R.drawable.scene_food
    Category.education -> R.drawable.scene_education
    Category.health -> R.drawable.scene_health
    Category.transport -> R.drawable.scene_parking
    Category.events -> R.drawable.scene_fest
}

fun sceneScrim(
    top: Float = 0.22f,
    mid: Float = 0.38f,
    bottom: Float = 0.78f,
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
    content: @Composable BoxScope.() -> Unit = {},
) {
    Box(modifier) {
        Image(
            painter = painterResource(resId),
            contentDescription = null,
            contentScale = ContentScale.Crop,
            modifier = Modifier.fillMaxSize(),
        )
        Box(Modifier.fillMaxSize().background(overlay))
        content()
    }
}
